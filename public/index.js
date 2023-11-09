import {Menu, MENU_RENDER_TYPES} from './components/Menu/Menu.js';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js',{scope: '/'})
        .then((reg) => {
            console.log('sw registered', reg);
        })
        .catch((e) => {
            console.error(e);
        });
}

const rootElement = document.querySelector('#root');
const menuElement = document.createElement('aside');
const pageElement = document.createElement('main');
rootElement.appendChild(menuElement);
rootElement.appendChild(pageElement);


const config = {
    menu: {
        feed: {
            href: '/feed',
            name: 'Лента',
            render: renderFeed,
        },
        login: {
            href: '/login',
            name: 'Авторизоваться',
            render: renderLogin,
        },
        signup: {
            href: '/signup',
            name: 'Зарегистрироваться',
            render: renderSignup,

        },
        profile: {
            href: '/profile',
            name: 'Профиль',
            render: renderProfile,
        },
        // // Вектор атаки XSS. Работает, если делать рендер через строку. Для ознакомления!
        // danger: {
        //     name: `Опасность <iframe src="https://example.com" onload="alert('Упс, сайт взломали!')"></iframe>`,
        //     href: '/',
        //     render: () => {},
        // }
    }
};

// Вместо renderingMenu
const menu = new Menu(menuElement, config.menu);
menu.render(MENU_RENDER_TYPES.DOM);

function createInput(type, text, name) {
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.placeholder = text;

    return input;
}

function renderLogin() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Войти!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(submitBtn);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Используем наш модуль
        Ajax.post({
            url: '/login',
            body: {password, email},
            callback: (status) => {
                if (status === 200) {
                    goToPage(menu.state.menuElements.profile);
                    return;
                }

                alert('НЕВЕРНЫЙ ЕМЕЙЛ ИЛИ ПАРОЛЬ');
            }
        })
    });

    return form;
}

function renderSignup() {
    const form = document.createElement('form');

    const emailInput = createInput('email', 'Емайл', 'email');
    const passwordInput = createInput('password', 'Пароль', 'password');
    const ageInput = createInput('number', 'Возраст', 'age');

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.value = 'Зарегестрироваться!';

    form.appendChild(emailInput);
    form.appendChild(passwordInput);
    form.appendChild(ageInput);
    form.appendChild(submitBtn);

    return form;
}

function renderFeed() {
    const feedElement = document.createElement('div');

    // Используем наш модуль
    Ajax.get({
        url: '/feed',
        callback: (status, responseString) => {
            let isAuthorized = false;

            if (status === 200) {
                isAuthorized = true;
            }

            if (!isAuthorized) {
                alert('Нет авторизации!');
                goToPage(menu.state.menuElements.login);
                return;
            }

            const images = JSON.parse(responseString);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                feedElement.appendChild(div);

                images.forEach(({src, likes}) => {
                    div.innerHTML += `<img src="${src}" width="500" /><div>${likes} лайков</div>`;
                });
            }
        }
    })

    return feedElement;
}

function renderProfile() {
    const profileElement = document.createElement('div');

    // Используем наш модуль
    Ajax.get({
        url: '/me',
        callback: (status, responseString) => {
            const isAuthorized = status === 200;


            if (!isAuthorized) {
                alert('АХТУНГ! НЕТ АВТОРИЗАЦИИ');
                goToPage(menu.state.menuElements.login);

                return;
            }

            const {email, images, age} = JSON.parse(responseString);

            const span = document.createElement('span');
            span.textContent =`${email} ${age} лет`;
            profileElement.appendChild(span);

            if (images && Array.isArray(images)) {
                const div = document.createElement('div');
                profileElement.appendChild(div);

                images.forEach(({src, likes}) => {
                    div.innerHTML += `<img src="${src}" width="500" /><div>${likes} лайков</div>`
                });
            }
        }
    })

    return profileElement;
}

function goToPage(menuLink) {
    if (menuLink === menu.state.activeMenu) {
        return;
    }

    menu.state.activeMenu.classList.remove('active');
    menuLink.classList.add('active');
    menu.state.activeMenu = menuLink;

    pageElement.innerHTML = '';

    const el = config.menu[menuLink.dataset.section].render();

    pageElement.appendChild(el);
}

const feedElement = renderFeed();
pageElement.appendChild(feedElement);

menuElement.addEventListener('click', (e) => {
    const { target } = e;

    if (target.tagName.toLocaleUpperCase() === 'A' || target instanceof HTMLAnchorElement) {
        e.preventDefault();

       goToPage(e.target);
    }

});

