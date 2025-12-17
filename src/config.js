export const defaultConfig = {
    placeholder: 'Select an option',
    allowClear: false,
    required: false,
    multiple: false,
    closeOnSelect: true,
    api: false,
    searchKeys: ['text'],
    renderOption: null,
    renderSelected: null,
    preSelectedId: null,
    onSelect: null,
    contents: {
        searchPlaceholder: 'Search...',
        emptyMessage: 'No results found',
        minInputLengthMessage: (minLength) => `Please enter ${minLength} or more characters`,
        loading: 'Loading...',
        error: 'An error occurred while fetching data.',
        clearIcon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
        arrowIconDown: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>',
        arrowIconUp: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>'
    },
    classMap: {
        container: 'relative w-full',
        trigger: 'flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 cursor-pointer min-h-[42px] dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-gray-500 dark:focus:border-gray-500',
        placeholder: 'text-gray-400 dark:text-gray-500 truncate',
        text: 'truncate',
        icons: 'flex items-center space-x-2 ml-2 text-gray-400 dark:text-gray-500',
        clear: 'hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer',
        arrow: 'pointer-events-none',
        dropdown: 'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none pb-1 dark:bg-gray-800 dark:border-gray-600',
        searchContainer: 'sticky top-0 z-10 bg-white border-b border-gray-200 p-2 dark:bg-gray-800 dark:border-gray-600',
        searchInput: 'w-full px-2 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-gray-500 dark:focus:border-gray-500',
        option: 'relative flex items-center w-full px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 select-none dark:text-gray-300 dark:hover:bg-gray-700',
        optionText: 'truncate',
        selectedOption: 'bg-gray-100 dark:bg-gray-700',
        selectedOptionText: 'font-medium text-gray-900 dark:text-white',
        empty: 'px-3 py-2 text-sm text-gray-500 text-center dark:text-gray-400',
        loading: 'px-3 py-2 text-sm text-gray-500 text-center dark:text-gray-400',
        error: 'px-3 py-2 text-sm text-red-500 text-center dark:text-red-400',
        tag: 'inline-flex items-center px-2 py-1 mr-1 text-xs font-medium text-gray-800 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300',
        tagRemove: 'ml-1 text-gray-600 hover:text-gray-900 cursor-pointer focus:outline-none dark:text-gray-400 dark:hover:text-gray-200'
    }
};

export function configure(options) {
    if (typeof options !== 'object' || options === null) {
        console.error('Alpine Select: Configuration must be an object.');
        return;
    }

    for (const key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
            if (!Object.prototype.hasOwnProperty.call(defaultConfig, key)) {
                console.warn(`Alpine Select: Unknown configuration option "${key}". Ignoring.`);
                continue;
            }

            const value = options[key];
            const defaultValue = defaultConfig[key];

            // Basic type validation
            if (key === 'classMap') {
                if (typeof value !== 'object' || value === null) {
                    console.error(`Alpine Select: "classMap" must be an object.`);
                    continue;
                }
                defaultConfig.classMap = { ...defaultConfig.classMap, ...value };
            } else if (key === 'contents') {
                if (typeof value !== 'object' || value === null) {
                    console.error(`Alpine Select: "contents" must be an object.`);
                    continue;
                }
                defaultConfig.contents = { ...defaultConfig.contents, ...value };
            } else {
                if (typeof defaultValue === 'boolean' && typeof value !== 'boolean' && value !== null) {
                        console.error(`Alpine Select: Option "${key}" must be a boolean.`);
                        continue;
                }
                if (typeof defaultValue === 'string' && typeof value !== 'string') {
                    console.error(`Alpine Select: Option "${key}" must be a string.`);
                    continue;
                }
                // Allow function for renderOption and renderSelected
                if ((key === 'renderOption' || key === 'renderSelected' || key === 'onSelect') && value !== null && typeof value !== 'function') {
                    console.error(`Alpine Select: Option "${key}" must be a function.`);
                    continue;
                }
                
                defaultConfig[key] = value;
            }
        }
    }
}

export function validateData(data) {
    if (!Array.isArray(data)) {
        console.error('Alpine Select: Data must be an array.');
        return false;
    }
    const invalidItems = data.filter(item => 
        typeof item !== 'object' || item === null || !item.hasOwnProperty('id') || !item.hasOwnProperty('text')
    );
    if (invalidItems.length > 0) {
        console.error('Alpine Select: All items in "data" must be objects with "id" and "text" properties.', invalidItems);
        return false;
    }
    return true;
}

export function validateConfig(config) {
    if (!config.name || typeof config.name !== 'string') {
        console.error('Alpine Select: "name" is required and must be a string.');
    }

    if (config.renderOption && typeof config.renderOption !== 'function') {
        console.error('Alpine Select: "renderOption" must be a function.');
    }

    if (config.renderSelected && typeof config.renderSelected !== 'function') {
        console.error('Alpine Select: "renderSelected" must be a function.');
    }

    if (config.onSelect && typeof config.onSelect !== 'function') {
        console.error('Alpine Select: "onSelect" must be a function.');
    }
    
    if (typeof config.closeOnSelect !== 'boolean') {
            console.error('Alpine Select: "closeOnSelect" must be a boolean.');
    }

    if (!Array.isArray(config.searchKeys) || config.searchKeys.length === 0) {
        console.error('Alpine Select: "searchKeys" must be a non-empty array of strings.');
    }

    if (config.api) {
        if (typeof config.api !== 'object' || config.api === null) {
            console.error('Alpine Select: "api" must be an object.');
            config.api = false;
            return;
        }
        if (!config.api.url || (typeof config.api.url !== 'string' && typeof config.api.url !== 'function')) {
            console.error('Alpine Select: "api.url" is required and must be a string or function.');
        }
        if (config.api.minInputLength && typeof config.api.minInputLength !== 'number') {
            console.error('Alpine Select: "api.minInputLength" must be a number.');
        }
        if (config.api.delay && typeof config.api.delay !== 'number') {
            console.error('Alpine Select: "api.delay" must be a number.');
        }
        if (config.api.result && typeof config.api.result !== 'function') {
            console.error('Alpine Select: "api.result" must be a function.');
        }
        if (config.api.method && typeof config.api.method !== 'string') {
            console.error('Alpine Select: "api.method" must be a string.');
        }
        if (config.api.headers && (typeof config.api.headers !== 'object' || config.api.headers === null)) {
            console.error('Alpine Select: "api.headers" must be an object.');
        }
    } else {
        validateData(config.data);
    }
}