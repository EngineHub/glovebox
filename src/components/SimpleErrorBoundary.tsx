import React from "react";

interface SimpleErrorBoundaryProps extends React.PropsWithChildren<{}> {
    context?: string
}

interface SimpleErrorBoundaryState {
    error?: Error
}

export class SimpleErrorBoundary extends React.Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
    constructor(props: SimpleErrorBoundaryProps) {
        super(props);
        this.state = {};
    }

    static getDerivedStateFromError(error: Error): Partial<SimpleErrorBoundaryState> {
        return {
            error: error
        };
    }

    render() {
        if (typeof this.state.error !== "undefined") {
            const error = this.state.error;
            return <div>
                <h5>
                    An error occurred in {this.props.context || "the application"}.
                </h5>
                <div>
                    Raw Error:
                    <code className="bg-dark text-white p-1 m-1">
                        {error.message}
                    </code>
                    <details>
                        <summary>Stack</summary>
                        <pre className="bg-dark p-1">
                            {error.stack}
                        </pre>
                    </details>
                </div>
            </div>;
        }
        return this.props.children;
    }
}
