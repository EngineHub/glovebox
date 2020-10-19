import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import {ScrollToTop} from "../compat/ScrollToTop";
import {SimpleErrorBoundary} from "../SimpleErrorBoundary";
import {MainPage} from "./MainPage";
import {JavadocPage} from "./JavadocPage";

export const App: React.FC = () => {
    return <SimpleErrorBoundary context="the application root">
        <Router>
            <ScrollToTop/>
            <div>
                <SimpleErrorBoundary context="the application routing">
                    <Switch>
                        <Route path="/:group/:name/:version/:path*">
                            <SimpleErrorBoundary context="a specific javadoc page">
                                <JavadocPage/>
                            </SimpleErrorBoundary>
                        </Route>
                        <Route path="/">
                            <SimpleErrorBoundary context="the main page">
                                <MainPage/>
                            </SimpleErrorBoundary>
                        </Route>
                    </Switch>
                </SimpleErrorBoundary>
            </div>
        </Router>
    </SimpleErrorBoundary>;
};
