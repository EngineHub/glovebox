import React from "react";
import {Link} from "react-router-dom";

export const MainPage: React.FC = () => {
    return <div>
        Welcome to EngineHub's JavaDoc server!
        <ul>
            <li><Link to="/com.sk89q.worldedit/worldedit-core/7.1.0">WorldEdit</Link></li>
        </ul>
    </div>;
};
