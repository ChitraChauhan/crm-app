import React, { Component } from 'react';
import { Navigator } from 'react-onsenui';

class App extends Component {
    constructor(props) {
        super(props);
        this._navigator = null;
    }

    render() {
        const { routes } = this.props;
        console.log(routes)
        return (
            // <div>
            // </div>
            <Navigator
            renderPage={(route, navigator) => {
                this._navigator = navigator;
                let Route = route.component ? { component: route.component, path: route.path || false } : routes.find(r => r.path === route.name);
                if (!Route || !Route.component) {
                    Route = routes.find(r => r.path === 'NotFound');
                };
                const RenderPage = Route.component;
                const key = route.key || Route.path;
                const mainProps = route.mainProps || {};
                const Page = <RenderPage {...mainProps} {...{ navigator, route, key }} />;
                return Page;
            }}
            initialRoute={{
                name: 'Home',
                main: true,
                splash: true,
            }} 
            />
        )
    }
}

export default App