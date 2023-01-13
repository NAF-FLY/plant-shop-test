const form = document.getElementsByTagName('form')[0]

const spinner = document.querySelector('.spinner-block')
const popupTableEl = document.querySelector('.popup-table')
const formBtn = document.querySelector('.header__form-button')
const bgPopup = document.querySelector('.background-popup')
const popupForm = document.querySelector('.popup-form')
const closeBtn = document.querySelector('.popup-form__close-btn')
const sendBtn = document.querySelector('.popup-form__send-btn')
const cancelBtn = document.querySelector('.popup-form__cancel-btn')
const popupTableBody = document.querySelector('.popup-table__body')
const closeBtn1 = document.querySelector('.popup-table__close-icon')

const closePopup = () => {
	// закрытие модального окна
	bgPopup.classList.add('hide')
	popupForm.classList.add('hide')
}

closeBtn.addEventListener('click', closePopup)
cancelBtn.addEventListener('click', closePopup)

formBtn.addEventListener('click', () => {
	bodyScroll.disable()
	bgPopup.classList.remove('hide')
	popupForm.classList.remove('hide')
})

const bodyScroll = {
	scrollBarWidth: window.innerWidth - document.body.clientWidth,
	disable() {
		// доп.отступы, чтобы страница не "скакала" при скрытии скролла
		document.body.style.marginRight = `${this.scrollBarWidth}px`
		document.body.style.overflowY = 'hidden'
	},
	enable() {
		document.body.style.marginRight = null
		document.body.style.overflowY = null
	},
}

closeBtn1.addEventListener('click', () => {
	// закрытие таблицы таблицу
	bodyScroll.enable()
	popupTableBody.innerHTML = ''
	popupTableEl.classList.add('hide')
	bgPopup.classList.add('hide')
})

const fillTable = users => {
	// заполнение таблицы
	popupTableBody.innerHTML = ''
	users.forEach(user => {
		popupTableBody.innerHTML += `
                <tr class="popup-table__row">
                    <td class="popup-table__cell">${user.userId}</td>
                    <td class="popup-table__cell">${user.id}</td>
                    <td class="popup-table__cell">${user.title}</td>
                    <td class="popup-table__cell">${user.completed}</td>
                </tr>
            `
	})
}

// будем получать и сразу отфильтровывать данные из запроса
const getDate = (url, userId, completed) => {
	// получение отфильтрованных данных из сервера
	popupForm.classList.add('hide')
	spinner.classList.remove('hide') // появление спиннера

	fetch(url, {
		// отправка запроса на сервер
		method: 'GET',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
	})
		.then(response => {
			// проверка на ошибку
			if (response.status >= 200 && response.status < 300) {
				return response
			} else {
				let error = new Error(response.statusText)
				error.response = response
				throw error
			}
		})
		.then(response => response.json())
		.then(data => {
			// получение данных
			const users = data

			setTimeout(() => {
				// показ таблицы (setTimeout, чтоб можно было увидить спиннер)
				spinner.classList.add('hide')
				popupTableEl.classList.remove('hide')
			}, 1500)

			const filteredUsers = users.filter(
				user => user.userId === userId && user.completed === completed
			) // фильтровка данных
			// popupTable()
			fillTable(filteredUsers) // отрисовка отфильтрованных данных в таблице
		})
		.catch(() => {
			// обработка ошибки
			setTimeout(() => {
				spinner.classList.add('hide')
			}, 1500)
		})
}

// Validation
const _name = document.getElementById('name'),
	_tel = document.getElementById('tel')

form.addEventListener('submit', event => {
	event.preventDefault()
	let isFormValid = true

	if (validateName(_name.value)) {
		_name.classList.remove('popup-form__name-input_error')
	} else {
		_name.classList.add('popup-form__name-input_error')
		isFormValid = false
	}

	if (validatePhone(_tel.value)) {
		_tel.classList.remove('popup-form__phone-input_error')
	} else {
		_tel.classList.add('popup-form__phone-input_error')
		isFormValid = false
	}

	// если все введено верно, отправляем запрос на сервер
	if (isFormValid) {
		getDate('https://jsonplaceholder.typicode.com/todos', 5, false)
	}
})

// проверка валидности введеных данных с использованием регулярных выражений
function validateName(name) {
	let regex = /^[а-яА-ЯёЁa-zA-Z0-9]{3,}$/
	return regex.test(name)
}

function validatePhone(phone) {
	let regex =
		/^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
	return regex.test(phone)
}

// Маска для удобного ввода номера телефона (решение взято со stackOverflow)
;[].forEach.call(document.querySelectorAll('#tel'), function (input) {
	let keyCode
	function mask(event) {
		event.keyCode && (keyCode = event.keyCode)
		let pos = this.selectionStart
		if (pos < 3) event.preventDefault()
		let matrix = '+7 (___) ___ __ __',
			i = 0,
			def = matrix.replace(/\D/g, ''),
			val = this.value.replace(/\D/g, ''),
			new_value = matrix.replace(/[_\d]/g, function (a) {
				return i < val.length ? val.charAt(i++) || def.charAt(i) : a
			})
		i = new_value.indexOf('_')
		if (i != -1) {
			i < 5 && (i = 3)
			new_value = new_value.slice(0, i)
		}
		var reg = matrix
			.substring(0, this.value.length)
			.replace(/_+/g, function (a) {
				return '\\d{1,' + a.length + '}'
			})
			.replace(/[+()]/g, '\\$&')
		reg = new RegExp('^' + reg + '$')
		if (
			!reg.test(this.value) ||
			this.value.length < 5 ||
			(keyCode > 47 && keyCode < 58)
		)
			this.value = new_value
		if (event.type == 'blur' && this.value.length < 5) this.value = ''
	}
	input.addEventListener('input', mask, false)
	input.addEventListener('focus', mask, false)
	input.addEventListener('blur', mask, false)
	input.addEventListener('keydown', mask, false)
})
