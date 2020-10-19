import React from "react";
import {Redirect, useParams} from "react-router";
import {Javadoc, JavadocPath} from "../Javadoc";

export const JavadocPage: React.FC = () => {
    const params = useParams<JavadocPath & { path: string | undefined }>();
    return params.path
        ? <Javadoc {...params}/>
        : <Redirect to={`/${params.group}/${params.name}/${params.version}/overview-summary.html`}/>;
};
