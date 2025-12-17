import { defaultConfig, configure, validateConfig, validateData } from './config.js';
import { UI } from './ui.js';
import { createInitialState } from './state.js';
import { ApiService } from './api.js';

class Select {
    static configure = configure;

    constructor(el, config, Alpine) {
        this.el = el;
        this.Alpine = Alpine;
        
        this.config = { ...defaultConfig, ...config };
        this.config.classMap = { ...defaultConfig.classMap, ...(config.classMap || {}) };
        this.config.contents = { ...defaultConfig.contents, ...(config.contents || {}) };
        
        validateConfig(this.config);

        this.data = this.config.data || [];
        this.state = createInitialState(this.config, this.data, Alpine);
        
        this.ui = new UI(this.state, this.config, this);
        this.ui.build(this.el);

        if (this.config.api) {
            this.apiService = new ApiService(this.state, this.config.api);
        }

        this.init();
    }

    init() {
        this.exposePublicApi();
        this.setupEffects();
        this.setupEventListeners();

        if (this.state.selected && (Array.isArray(this.state.selected) ? this.state.selected.length > 0 : true)) {
            setTimeout(() => {
                this.dispatchChange();
            }, 0);
        }
    }

    exposePublicApi() {
        Object.defineProperty(this.el, 'value', {
            get: () => this.state.selected
        });

        this.el.getOptions = () => {
            return this.data;
        };

        this.el.updateData = (options) => {
            if (!validateData(options)) {
                return;
            }
            if (this.config.multiple) {
                this.state.selected = [];
            } else {
                this.state.selected = null;
            }
            if (this.apiService) {
                this.apiService.updateData(options);
            } else {
                this.data = options;
                this.state.filteredData = options;
            }
            this.dispatchChange();
        };
    }

    handleClear(e) {
        e.stopPropagation();
        if (this.config.required) return;
        
        if (this.config.multiple) {
            this.state.selected = [];
        } else {
            this.state.selected = null;
        }
        this.dispatchChange();
    }

    toggleDropdown() {
        this.state.open = !this.state.open;
        if (this.state.open) {
            setTimeout(() => this.ui.searchInput.focus(), 50);
        }
    }

    selectItem(item) {
        if (this.config.multiple) {
            const index = this.state.selected.findIndex(i => i.id === item.id);
            if (index === -1) {
                this.state.selected.push(item);
            } else {
                this.state.selected.splice(index, 1);
            }
        } else {
            this.state.selected = item;
        }
        
        if (this.config.closeOnSelect) {
            this.state.open = false;
        }
        
        this.dispatchChange();

        if (this.config.onSelect) {
            this.config.onSelect(this.state.selected, this.data);
        }
    }

    dispatchChange() {
        this.el.dispatchEvent(new CustomEvent('x-select:change', {
            detail: this.state.selected,
            bubbles: true
        }));
    }

    setupEffects() {
        this.Alpine.effect(() => {
            const searchTerm = this.state.search;

            if (this.apiService) {
                this.apiService.search();
            } else {
                this.state.filteredData = this.data.filter(item => {
                    return this.config.searchKeys.some(key => {
                        return String(item[key]).toLowerCase().includes(searchTerm.toLowerCase());
                    });
                });
            }
        });

        this.Alpine.effect(() => {
            this.ui.renderOptions();
        });

        this.Alpine.effect(() => {
            this.ui.updateTriggerDisplay();
            this.ui.list.style.display = this.state.open ? 'block' : 'none';
            this.ui.arrow.innerHTML = this.state.open ? this.config.contents.arrowIconUp : this.config.contents.arrowIconDown;

            const hasSelection = this.config.multiple ? this.state.selected.length > 0 : !!this.state.selected;

            if (this.config.allowClear && hasSelection && !this.config.required && !this.config.multiple) {
                this.ui.clearButton.style.display = 'block';
                this.ui.arrow.style.display = 'none';
            } else {
                this.ui.clearButton.style.display = 'none';
                this.ui.arrow.style.display = 'block';
            }

            if (!this.state.open) {
                this.state.search = '';
                this.ui.searchInput.value = '';
            }
            
            this.ui.updateNativeSelect();
        });
    }

    setupEventListeners() {
        this.clickOutsideHandler = (e) => {
            if (!this.el.contains(e.target)) {
                this.state.open = false;
            }
        };
        document.addEventListener('click', this.clickOutsideHandler);
    }

    destroy() {
        document.removeEventListener('click', this.clickOutsideHandler);
    }
}

const AlpineSelect = (Alpine) => {
    Alpine.directive('select', (el, { expression }, { evaluateLater, cleanup }) => {
        const evaluate = evaluateLater(expression || '{}');
        
        evaluate(config => {
            const select = new Select(el, config || {}, Alpine);
            cleanup(() => select.destroy());
        });
    });
};

AlpineSelect.configure = Select.configure;

export { Select };
export default AlpineSelect;