// Тип рендера для демонстрации
export const MENU_RENDER_TYPES = {
    DOM: 'DOM',
    STRING: 'STRING',
    TEMPLATE: 'TEMPLATE'
};

// Не-дефолтный экспорт
export class Menu {
    #parent
    #config

    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        // Инициализация состояния компонента
        this.state = {
            activeMenu: null,
            menuElements: {},
        }

    }

    // Демонстрация работы геттера
    get config() {
        return this.#config;
    }

    // Адаптер для удобства
    get items() {
        return Object.entries(this.config).map(([key, { href, name }]) => ({
            key,
            href,
            name
        }));
    }

    // Эта функция нужна для демонстрации разных видов рендера
    render(renderType = MENU_RENDER_TYPES.DOM) {
        switch(renderType) {
            case MENU_RENDER_TYPES.STRING:
                this.renderString();
                break;
            case MENU_RENDER_TYPES.TEMPLATE:
                this.renderTemplate();
                break;
            case MENU_RENDER_TYPES.DOM:
            default:
                this.renderDOM();
        }
    }

    // Рендер с использованием шаблонов. Этот подход — правильный!
    // Не обязательно Handlebars. Есть множество решений.
    renderTemplate() {
        // Чтобы это работало, нужно импортировать handlebars.runtime.js
        const template = Handlebars.templates['Menu.hbs'];

        const items = this.items.map((element, index) => {
            let className = 'menu__item';
            if (index === 0) {
                className += ' active';
            }
            return {...element, className};
        })

        this.#parent.innerHTML = template({items});

        // Дополнительно для работы со стейтом. Конечно, дублировать код — плохая практика.
        const elements = this.#parent.querySelectorAll('[data-section]');
        elements.forEach((element, index) => {
            if (index === 0) {
                this.state.activeMenu = element;
            }
            this.state.menuElements[element.dataset.section] = element;
        })
    }

    // Рендер через шаблонную строку. Это опасно — можно получить XSS. В index.js есть пример такой атаки в config.menu.
    renderString() {
        this.#parent.innerHTML = this.items.map(({key, href, name}, index) => {
            let className = 'menu__item';
            if (index === 0) {
                className += ' active';
            }

            return `<a class="${className}" href="${href}" data-section="${key}">${name}</a>`;
        }).join('\n');

        // Дополнительно для работы со стейтом. Конечно, дублировать код — плохая практика.
        const elements = this.#parent.querySelectorAll('[data-section]');
        elements.forEach((element, index) => {
            if (index === 0) {
                this.state.activeMenu = element;
            }
            this.state.menuElements[element.dataset.section] = element;
        })
    }

    // Это классический вид рендера. Безопасно, но неудобно
    renderDOM() {
        this.items.map(({key, href, name}, index) => {
            const menuElement = document.createElement('a');
            menuElement.href = href;
            menuElement.textContent = name;
            menuElement.dataset.section = key;
            menuElement.classList.add('menu__item');

            if (index === 0) {
                menuElement.classList.add('active');
                this.state.activeMenu = menuElement;
            }

            this.state.menuElements[key] = menuElement;

            return menuElement;
        }).forEach(element => {
            this.#parent.appendChild(element);
        })
    }
}