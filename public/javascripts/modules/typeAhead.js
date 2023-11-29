import axios from 'axios'

function searchResultsHtml(stores) {
    return stores.map(store => {
        return `
        <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
        </a>
        `
    }).join('')
}


function typeAhead(search) {
    if (!search) return

    const searchInput = search.querySelector('input[name="search"]')
    const searchResults = search.querySelector('.search__results')


    searchInput.on('input', function () {
        if (!this.value) {
            searchResults.style.display = 'none'
        }
        searchResults.style.display = 'block'
        searchResults.innerHTML = ''

        axios.get(`/api/search?q=${this.value}`).then(res => {
            if (res.data.length) {
                const html = searchResultsHtml(res.data)
                searchResults.innerHTML = html
            }
        }).catch(err => { console.log(err) })
    })

    // handle Keyboard inputs
}

export default typeAhead