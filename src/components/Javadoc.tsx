import React, {useEffect, useState} from "react";
import JSZip from "jszip";
import {replaceAsync} from "../util";
import SHA256 from "crypto-js/sha256";

const MAVEN_SOURCE = "https://maven.enginehub.org/repo";

export interface JavadocPath {
    group: string;
    name: string;
    version: string;
    path: string;
}

interface Empty {
    type: "empty";
}

interface Success {
    type: "success";
    content: string;
}

interface Error {
    type: "error";
    error: string;
}

type HtmlState = Empty | Success | Error;

function buildUrl(path: JavadocPath): string {
    const fixedGroup = path.group.replace(/\./g, '/');
    return `${MAVEN_SOURCE}/${fixedGroup}/${path.name}/${path.version}/${path.name}-${path.version}-javadoc.jar`;
}

const LOADED_DATA = new Set<string | ArrayBuffer>();

async function loadFromZip(zip: JSZip, relativeUrl: string): Promise<string | undefined> {
    const scriptData = await zip.file(relativeUrl)?.async("string");
    if (!scriptData) {
        if (relativeUrl === "resources/fonts/dejavu.css") {
            // this is expected
            return;
        }
        console.warn(`Failed to find ${relativeUrl} in zip`);
        return;
    }
    return scriptData;
}

async function loadScripts(doc: Document, zip: JSZip): Promise<void> {
    for (const script of Array.from(doc.scripts)) {
        if (script.src) {
            if (!LOADED_DATA.has(script.src)) {
                const relativeSrc = script.src.substring(script.src.lastIndexOf('/') + 1);
                const scriptData = await loadFromZip(zip, relativeSrc);
                if (!scriptData) {
                    continue;
                }
                const newScript = document.createElement("script");
                newScript.innerHTML = scriptData;
                document.head.appendChild(newScript);
                LOADED_DATA.add(script.src);
            }
        } else {
            const key = SHA256(script.innerHTML).toString();
            if (!LOADED_DATA.has(key)) {
                document.head.appendChild(script);
                LOADED_DATA.add(key);
            }
        }
    }
}

async function loadLinks(doc: Document, zip: JSZip): Promise<void> {
    for (const link of Array.from(doc.getElementsByTagName("link"))) {
        if (link.rel !== "stylesheet") {
            console.log(`Dropping`, link);
            continue;
        }
        if (!LOADED_DATA.has(link.href)) {
            const relativeHref = link.href.substring(link.href.lastIndexOf('/') + 1);
            let cssData = await loadFromZip(zip, relativeHref);
            if (!cssData) {
                continue;
            }

            cssData = await replaceAsync(cssData, /@import url\('(.+?)'\);/, async (_, url) => {
                return (await loadFromZip(zip, url as string)) || "/* failed to import */";
            });

            const newStyle = document.createElement("style");
            newStyle.innerHTML = cssData;
            document.head.appendChild(newStyle);
            LOADED_DATA.add(link.href);
        }
    }
}

export const Javadoc: React.FC<JavadocPath> = (path: JavadocPath) => {
    const [html, setHtml] = useState<HtmlState>({type: "empty"});

    useEffect(() => {
        let unmounted = false;
        fetch(buildUrl(path))
            .then(async r => {
                if (unmounted) {
                    return;
                }
                if (r.status != 200) {
                    throw "Couldn't retrieve JAR from Maven";
                }
                const zip = await JSZip.loadAsync(await r.blob());
                let data = await zip.file(path.path)?.async("string");
                if (data) {
                    const doc = new DOMParser().parseFromString(data, "text/html");
                    const titleElement = doc.getElementsByTagName("title");
                    if (titleElement.length > 0) {
                        document.title = titleElement[0].textContent || "";
                    }
                    await loadScripts(doc, zip);
                    await loadLinks(doc, zip);
                    data = doc.body.innerHTML;
                } else {
                    data = `${path.path} not found.`;
                }
                setHtml({type: "success", content: data});
            })
            .catch(err => unmounted || setHtml({type: "error", error: err.toString()}));
        return (): void => {
            unmounted = true;
        };
    }, [path]);

    switch (html.type) {
        case "empty":
            return <div>Loading...</div>;
        case "success":
            return <RealBody>{html.content}</RealBody>;
        default:
            return <div>Error: {html.error}</div>;
    }
};

const RealBody: React.FC<{children: string}> = ({children}) => {
    useEffect(() => {
        document.getElementsByName(window.location.hash.substring(1))[0]?.scrollIntoView();
    }, [children]);
    return <div dangerouslySetInnerHTML={{__html: children}}/>;
};
