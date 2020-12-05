let mealsState = []
let ruta = 'login' //login*, register, orders
let user = {}

const stringToHTML = (s) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    return doc.body.firstChild
}

const renderItem = (item) => {
    const element = stringToHTML(`<li data-id=${item._id}>${item.name}</li>`)
    
    element.addEventListener('click', () => {
        const mealsLits = document.getElementById('meals-list')
        const mealsId = document.getElementById('meals-id')
        Array.from(mealsLits.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        mealsId.value = item._id
    })

    return element
}

const renderOrder = (item, meals) => {
    const meal = meals.find( x => x._id === item.meal_id )
    const element = stringToHTML(`<li data-id=${item._id}>${meal.name} - ${item.user_id}</li>`)

    return element
}

const initializeForm = () => {
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) => {
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealsIDValue = mealId.value
        if (!mealsIDValue){
            alert("Debe seleccionar unplato")
            submit.removeAttribute('disabled')
            return
        }
        const order = {
            meal_id: mealsIDValue,
            user_id: user._id
        }
        
        fetch('https://serverless.sagescobar.vercel.app/api/orders', {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                authorization: localStorage.getItem('token')
            },
            body: JSON.stringify(order)
        })
            .then(x => x.json())
            .then(respuesta => {
                const renderedOrder = renderOrder(respuesta, mealsState)
                const orderList1 = document.getElementById('orders-list')
                orderList1.appendChild(renderedOrder)
                submit.removeAttribute('disabled')
            }).catch(e => console.log(e))
    }
}

const initializeData = () => {
    fetch('https://serverless.sagescobar.vercel.app/api/meals')
        .then(response => response.json())
        .then(data => {
            mealsState = data
            const mealsLits = document.getElementById('meals-list')
            const listItems = data.map(renderItem)
            mealsLits.removeChild(mealsLits.firstElementChild)
            listItems.forEach(element => {
                mealsLits.appendChild(element)
            })
            const submit = document.getElementById('submit')
            submit.removeAttribute('disabled')
            fetch('https://serverless.sagescobar.vercel.app/api/orders')
                .then(response => response.json())
                .then(ordersData => {
                    const ordersList = document.getElementById('orders-list')
                    const orderItems = ordersData.map(orderData => renderOrder(orderData, data))
                    ordersList.removeChild(ordersList.firstElementChild)
                    orderItems.forEach(element => {
                        ordersList.appendChild(element)
                    })
                })
        })
}

const login = () => {
    const logForm = document.getElementById('login-form')
    logForm.onsubmit = (e) => {
        e.preventDefault()
        const email = document.getElementById('user-name').value
        const pass = document.getElementById('password').value
        fetch('https://serverless.sagescobar.vercel.app/api/auth/login', {
        method: 'POST',
        headers:{
            "content-type": "application/json"
        },
        body: JSON.stringify({
            email,
            "password": pass
        })})
        .then(response => response.json())
        .then(x => {
            localStorage.setItem('token', x.token)
            ruta = 'orders'
            return x.token
        })
        .then(tok => {
            return fetch('https://serverless.sagescobar.vercel.app/api/auth/me', {
                method: 'GET',
                headers: {
                    "content-type": "application/json",
                    authorization: tok
                }
            })
        })
        .then(response => response.json())
        .then(fetchedUser => {
            localStorage.setItem('user', JSON.stringify(fetchedUser))
            user = fetchedUser
            renderApp()
        })
        .catch(e => console.log(e))
    }
}

const renderApp = () => {
    const token = localStorage.getItem('token')
    if(token){
        user = JSON.parse(localStorage.getItem('user'))
        const ordersView = document.getElementById('orders-view')
        document.getElementById('app').innerHTML = ordersView.innerHTML
        initializeForm()
        initializeData()
    }else{
        const logView = document.getElementById('login-view')
        document.getElementById('app').innerHTML = logView.innerHTML
        login()
    }
}

window.onload = () => {
    renderApp()
   //initializeForm()
   //initializeData()
}