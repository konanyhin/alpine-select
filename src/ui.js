export class UI {
    constructor(state, config, selectInstance) {
        this.state = state;
        this.config = config;
        this.select = selectInstance;
        this.classMap = config.classMap;
        this.contents = config.contents;
    }

    build(container) {
        this.addClasses(container, this.classMap.container);
        container.innerHTML = '';

        this.nativeSelect = this.createNativeSelect();
        container.appendChild(this.nativeSelect);

        this.trigger = this.createTrigger();
        container.appendChild(this.trigger);

        this.list = this.createList();
        container.appendChild(this.list);
    }

    addClasses(el, classes) {
        if (classes) {
            const classList = classes.split(' ').filter(Boolean);
            if (classList.length > 0) {
                el.classList.add(...classList);
            }
        }
    }

    createNativeSelect() {
        const select = document.createElement('select');
        if (this.config.name) select.name = this.config.name;
        if (this.config.multiple) select.multiple = true;
        select.style.display = 'none';
        if (this.config.required) select.setAttribute('required', 'required');
        return select;
    }

    createTrigger() {
        const trigger = document.createElement('div');
        this.addClasses(trigger, this.classMap.trigger);
        
        this.tagsContainer = document.createElement('div');
        this.addClasses(this.tagsContainer, 'x-select-tags-container');
        trigger.appendChild(this.tagsContainer);

        const iconsContainer = document.createElement('div');
        this.addClasses(iconsContainer, this.classMap.icons);

        this.clearButton = document.createElement('span');
        this.addClasses(this.clearButton, this.classMap.clear);
        this.clearButton.innerHTML = this.contents.clearIcon;
        this.clearButton.style.display = 'none';
        this.clearButton.addEventListener('click', (e) => this.select.handleClear(e));

        this.arrow = document.createElement('span');
        this.addClasses(this.arrow, this.classMap.arrow);
        this.arrow.innerHTML = this.contents.arrowIconDown;

        iconsContainer.appendChild(this.clearButton);
        iconsContainer.appendChild(this.arrow);
        trigger.appendChild(iconsContainer);

        trigger.addEventListener('click', () => this.select.toggleDropdown());

        return trigger;
    }

    createList() {
        const list = document.createElement('ul');
        this.addClasses(list, this.classMap.dropdown);
        list.style.display = 'none';

        const searchContainer = document.createElement('div');
        this.addClasses(searchContainer, this.classMap.searchContainer);
        
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.addClasses(this.searchInput, this.classMap.searchInput);
        this.searchInput.placeholder = this.contents.searchPlaceholder;
        this.searchInput.addEventListener('input', (e) => {
            this.state.search = e.target.value;
        });
        this.searchInput.addEventListener('click', e => e.stopPropagation());
        
        searchContainer.appendChild(this.searchInput);
        list.appendChild(searchContainer);

        this.loadingMessage = document.createElement('div');
        this.addClasses(this.loadingMessage, this.classMap.loading);
        this.loadingMessage.textContent = this.contents.loading;
        this.loadingMessage.style.display = 'none';
        list.appendChild(this.loadingMessage);

        this.minInputLengthMessage = document.createElement('div');
        this.addClasses(this.minInputLengthMessage, this.classMap.empty);
        this.minInputLengthMessage.style.display = 'none';
        list.appendChild(this.minInputLengthMessage);

        this.errorMessage = document.createElement('div');
        this.addClasses(this.errorMessage, this.classMap.error);
        this.errorMessage.textContent = this.contents.error;
        this.errorMessage.style.display = 'none';
        list.appendChild(this.errorMessage);

        this.emptyMessage = document.createElement('div');
        this.addClasses(this.emptyMessage, this.classMap.empty);
        this.emptyMessage.textContent = this.contents.emptyMessage;
        this.emptyMessage.style.display = 'none';
        list.appendChild(this.emptyMessage);

        return list;
    }

    renderOptions() {
        this.list.querySelectorAll('[data-x-select-option]').forEach(node => node.remove());
        
        const minLength = this.config.api.minInputLength || 0;
        const hasMinLength = this.config.api && this.state.search.length < minLength;

        this.minInputLengthMessage.style.display = hasMinLength ? 'block' : 'none';
        if (hasMinLength) {
            this.minInputLengthMessage.textContent = this.contents.minInputLengthMessage(minLength);
        }

        this.loadingMessage.style.display = this.state.loading ? 'block' : 'none';
        this.errorMessage.style.display = this.state.error ? 'block' : 'none';
        
        this.emptyMessage.style.display = 
            !this.state.loading && 
            !this.state.error && 
            !hasMinLength && 
            this.state.filteredData.length === 0 
            ? 'block' : 'none';

        this.state.filteredData.forEach(item => {
            const li = document.createElement('li');
            this.addClasses(li, this.classMap.option);
            li.setAttribute('data-x-select-option', '');
            
            const isSelected = this.config.multiple
                ? this.state.selected.some(i => i.id === item.id)
                : this.state.selected && this.state.selected.id === item.id;

            if (this.config.renderOption) {
                li.innerHTML = this.config.renderOption(item);
            } else {
                const span = document.createElement('span');
                this.addClasses(span, this.classMap.optionText);
                span.textContent = item.text;
                if (isSelected) {
                    this.addClasses(span, this.classMap.selectedOptionText);
                }
                li.appendChild(span);
            }
            
            if (isSelected) {
                this.addClasses(li, this.classMap.selectedOption);
            }

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                this.select.selectItem(item);
            });
            this.list.appendChild(li);
        });
    }

    updateNativeSelect() {
        this.nativeSelect.innerHTML = '';
        if (this.config.multiple) {
            this.state.selected.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.text;
                option.selected = true;
                option.setAttribute('selected', 'selected');
                this.nativeSelect.appendChild(option);
            });
        } else {
            if (this.state.selected) {
                const option = document.createElement('option');
                option.value = this.state.selected.id;
                option.textContent = this.state.selected.text;
                option.selected = true;
                option.setAttribute('selected', 'selected');
                this.nativeSelect.appendChild(option);
                this.nativeSelect.value = this.state.selected.id;
            } else {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = '';
                option.selected = true;
                option.setAttribute('selected', 'selected');
                this.nativeSelect.appendChild(option);
                this.nativeSelect.value = '';
            }
        }
        
        this.nativeSelect.dispatchEvent(new Event('change'));
    }

    updateTriggerDisplay() {
        this.tagsContainer.innerHTML = '';
        this.tagsContainer.className = '';
        
        if (this.config.multiple) {
            this.addClasses(this.tagsContainer, 'flex flex-wrap gap-1');
            if (this.state.selected.length > 0) {
                this.state.selected.forEach(item => {
                    const tag = document.createElement('span');
                    this.addClasses(tag, this.classMap.tag);
                    
                    if (this.config.renderSelected) {
                        tag.innerHTML = this.config.renderSelected(item);
                    } else {
                        tag.textContent = item.text;
                    }

                    const removeBtn = document.createElement('span');
                    this.addClasses(removeBtn, this.classMap.tagRemove);
                    removeBtn.innerHTML = this.contents.clearIcon;
                    removeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.select.selectItem(item);
                    });

                    tag.appendChild(removeBtn);
                    this.tagsContainer.appendChild(tag);
                });
            } else {
                this.addClasses(this.tagsContainer, this.classMap.placeholder);
                this.tagsContainer.textContent = this.config.placeholder;
            }
        } else {
            if (this.state.selected) {
                this.addClasses(this.tagsContainer, this.classMap.text);
                if (this.config.renderSelected) {
                    this.tagsContainer.innerHTML = this.config.renderSelected(this.state.selected);
                } else {
                    this.tagsContainer.textContent = this.state.selected.text;
                }
            } else {
                this.addClasses(this.tagsContainer, this.classMap.placeholder);
                this.tagsContainer.textContent = this.config.placeholder;
            }
        }
    }
}