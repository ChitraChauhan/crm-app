class service {
    constructor() {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('X-Requested-With', 'XMLHttpRequest');
        this.headers = headers;
        this.state = {
            baseURL: '/axelor-erp/ws/rest/'
        }
    }
    request(url, config = {}, data = {}) {
        const options = Object.assign({
            method: 'POST',
            credentials: 'include',
            headers: this.headers,
            body: JSON.stringify(data),
        }, config);
        return this.fetch(url, options)
    }
    fetch(url, options) {
        return fetch(url, options);
    }
    post(url, data) {
        const config = {
            method: 'POST'
        };
        return this.request(url, config, data);
    }
    get(url) {
        const config = {
            method: 'GET',
        }
        return this.request(url, config);
    }

    delete(url) {
        const config = {
            method: 'DELETE',
        }
        return this.request(url, config);
    }

    put(url, data) {
        const config = {
            method: 'PUT',
        };
        return this.request(url, config, data);
    }

    getData(entity, options) {
        const data = {
            ...options
        };
        const url = `${this.state.baseURL}${entity}/search`;
        return this.post(url, data);
    }
}

export default service