export function createInitialState(config, data, Alpine) {
    let initialSelected = config.multiple ? [] : null;

    if (!config.api && config.preSelectedId !== null && config.preSelectedId !== undefined) {
        if (config.multiple) {
            const ids = Array.isArray(config.preSelectedId) ? config.preSelectedId : [config.preSelectedId];
            const foundItems = data.filter(item => ids.includes(item.id));
            if (foundItems.length > 0) {
                initialSelected = foundItems;
            } else {
                console.error(`Alpine Select: preSelectedId(s) [${ids.join(', ')}] not found in data.`);
            }
        } else {
            const foundItem = data.find(item => item.id === config.preSelectedId);
            if (foundItem) {
                initialSelected = foundItem;
            } else {
                console.error(`Alpine Select: preSelectedId "${config.preSelectedId}" not found in data.`);
            }
        }
    }

    return Alpine.reactive({
        open: false,
        selected: initialSelected,
        displayText: config.placeholder,
        search: '',
        filteredData: config.api ? [] : data,
        loading: false,
        error: false
    });
}