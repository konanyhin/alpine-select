import axios from 'axios';

/**
 * Service for handling API requests
 */
export class ApiService {
    /**
     * @param {State} state
     * @param {object} apiConfig
     */
    constructor(state, apiConfig) {
        this.state = state;
        this.apiConfig = apiConfig;
        this.debounceTimer = null;
        this.abortController = null;
    }

    /**
     * Fetches data from the API based on the current search term
     */
    fetchData() {
        const minLength = this.apiConfig.minInputLength || 0;
        if (this.state.search.length < minLength) {
            this.state.filteredData = [];
            this.state.loading = false;
            return;
        }

        // Abort previous request if it's still running
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
                    return; // Ignore aborted requests
                }
                console.error('Alpine Select: API call failed.', error);
                this.state.filteredData = [];
                this.state.error = true;
                this.state.loading = false;
            });
    }

    /**
     * Initiates a debounced search request
     */
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

    /**
     * Updates the data directly, cancelling any pending requests
     * @param {Array} options
     */
    updateData(options) {
        if (this.abortController) {
            this.abortController.abort();
        }
        clearTimeout(this.debounceTimer);
        this.state.loading = false;
        this.state.filteredData = options;
    }
}