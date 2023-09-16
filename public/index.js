console.log('keklol');


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
        }
    }
};

const state = {
    activeMenu: null,
    menuElements: {},
}


function ajax(method, url, body = null, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        callback(xhr.status, xhr.responseText);
    });

    if (body) {
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf8');
        xhr.send(JSON.stringify(body));
        return;
    }

    xhr.send();
}

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

        ajax(
            'POST',
            '/login',
            {password, email},
            (status) => {
                if (status === 200) {
                    goToPage(state.menuElements.profile);
                    return;
                }

                alert('НЕВЕРНЫЙ ЕМЕЙЛ ИЛИ ПАРОЛЬ');
            }
        )
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

    ajax(
        'GET',
        '/feed',
        null,
        (status, responseString) => {
            let isAuthorized = false;

            if (status === 200) {
                isAuthorized = true;
            }

            if (!isAuthorized) {
                alert('Нет авторизации!');
                goToPage(state.menuElements.login);
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
    );

    return feedElement;
}

function renderProfile() {
    const profileElement = document.createElement('div');


    ajax(
        'GET',
        '/me',
        null,
        (status, responseString) => {
            const isAuthorized = status === 200;


            if (!isAuthorized) {
                alert('АХТУНГ! НЕТ АВТОРИЗАЦИИ');
                goToPage(state.menuElements.login);

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
    );


    return profileElement;
}

function renderingMenu() {
    Object
        .entries(config.menu)
        .map(([key, { href, name }], index) => {
            const menuElement = document.createElement('a');
            menuElement.href = href;
            menuElement.textContent = name;
            menuElement.dataset.section = key;

            if (index === 0) {
                menuElement.classList.add('active');
                state.activeMenu = menuElement;
            }

            state.menuElements[key] = menuElement;

            return menuElement;
        })
        .forEach(element => menuElement.appendChild(element))
    ;
}

function goToPage(menuLink) {
    if (menuLink === state.activeMenu) {
        return;
    }

    state.activeMenu.classList.remove('active');
    menuLink.classList.add('active');
    state.activeMenu = menuLink;

    pageElement.innerHTML = '';

    const el = config.menu[menuLink.dataset.section].render();

    pageElement.appendChild(el);
}

renderingMenu();
const feedElement = renderFeed();
pageElement.appendChild(feedElement);

menuElement.addEventListener('click', (e) => {
    const { target } = e;

    if (target.tagName.toLocaleUpperCase() === 'A' || target instanceof HTMLAnchorElement) {
        e.preventDefault();

       goToPage(e.target);
    }

});

