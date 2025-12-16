import axios from 'axios';

export class ApiService {
    constructor(state, apiConfig) {
        this.state = state;
        this.apiConfig = apiConfig;
        this.debounceTimer = null;
        this.abortController = null;
    }

    fetchData() {
        const minLength = this.apiConfig.minInputLength || 0;
        if (this.state.search.length < minLength) {
            this.state.filteredData = [];
            this.state.loading = false;
            return;
        }

        if (this.abortController) {
            this.abortController.abort();
        }
        this.abortController = new AbortController();

        this.state.loading = true;
        this.state.error = false;

        const url = typeof this.apiConfig.url === 'function' ? this.apiConfig.url(this.state.search) : this.apiConfig.url;
        const data = typeof this.apiConfig.data === 'function' 
            ? this.apiConfig.data(this.state.search) 
            : (this.apiConfig.data || { q: this.state.search });
            
        const method = (this.apiConfig.method || 'GET').toLowerCase();
        const headers = this.apiConfig.headers || {};

        const config = {
            method: method,
            url: url,
            headers: headers,
            signal: this.abortController.signal
        };

        if (method === 'get') {
            config.params = data;
        } else {
            config.data = data;
        }

        axios(config)
            .then(response => {
                this.state.filteredData = this.apiConfig.result(response);
                this.state.loading = false;
            })
            .catch(error => {
                if (axios.isCancel(error)) {
                    return;
                }
                console.error('Alpine Select: API call failed.', error);
                this.state.filteredData = [];
                this.state.error = true;
                this.state.loading = false;
            });
    }

    search() {
        const searchTerm = this.state.search;
        const minLength = this.apiConfig.minInputLength || 0;

        if (searchTerm.length >= minLength) {
            this.state.loading = true;
            this.state.error = false;
            this.state.filteredData = []; 
        }

        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.fetchData();
        }, this.apiConfig.delay || 0);
    }
}