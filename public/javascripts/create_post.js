const tagSearch = document.getElementById('tagSearch');
const searchResults = document.getElementById('searchResults');
const selectedTags = document.getElementById('selectedTags');
const tagsInput = document.getElementById('tags');

tagSearch.addEventListener('input', async (event) => {
    const searchTerm = event.target.value;
    if (searchTerm.length < 1) {
        searchResults.innerHTML = '';
        return;
    }

    const response = await fetch(`/tags/search/${searchTerm}`);
    const tags = await response.json();

    searchResults.innerHTML = '';
    tags.forEach(tag => {
        const currentTags = tagsInput.value ? tagsInput.value.split(',') : [];
        if (currentTags.includes(tag._id)) {
            return;
        }

        const tagElement = document.createElement('div');
        tagElement.textContent = tag.name;
        tagElement.classList.add('search-result');
        tagElement.addEventListener('click', () => {
            addToSelectedTags(tag);
            searchResults.innerHTML = '';
            tagSearch.value = '';
        });
        searchResults.appendChild(tagElement);
    });

    if (tags.length === 0) {
        const addTagButton = document.createElement('button');
        addTagButton.textContent = 'Add new tag';
        addTagButton.classList.add('btn', 'btn-sm', 'btn-primary');
        addTagButton.setAttribute('type', 'button');
        addTagButton.addEventListener('click', async () => {
            const newTag = {name: searchTerm};
            const response = await fetch('/tags', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newTag)
            });
            const createdTag = await response.json();
            addToSelectedTags(createdTag);
            searchResults.innerHTML = '';
            tagSearch.value = '';
        });
        searchResults.appendChild(addTagButton);
    }
});

function addToSelectedTags(tag) {
    const tagElement = document.createElement('span');
    tagElement.textContent = tag.name;
    tagElement.classList.add('badge', 'badge-pill', 'badge-primary', 'mr-2', 'mb-2', 'selected-tag');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'x';
    removeButton.classList.add('btn', 'btn-sm', 'btn-danger', 'ml-1');
    removeButton.addEventListener('click', () => {
        removeFromSelectedTags(tagElement, tag._id);
    });
    tagElement.appendChild(removeButton);
    selectedTags.appendChild(tagElement);

    const currentTags = tagsInput.value ? tagsInput.value.split(',') : [];
    currentTags.push(tag._id);
    tagsInput.value = currentTags.join(',');
}

function removeFromSelectedTags(tagElement, tagId) {
    tagElement.remove();

    const currentTags = tagsInput.value.split(',');
    const tagIndex = currentTags.indexOf(tagId);

    if (tagIndex > -1) {
        currentTags.splice(tagIndex, 1);
        tagsInput.value = currentTags.join(',');
    }
}