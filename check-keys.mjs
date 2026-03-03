fetch('https://jackspens.github.io/DolmaParmak/assets/index-DM50vnNc.js')
    .then(r => r.text())
    .then(t => {
        const match = t.match(/apiKey:"([^"]+)"/);
        if (match) {
            console.log('FOUND API KEY INITIALIZED:', match[1]);
        } else if (t.includes('apiKey:""')) {
            console.log('FOUND EMPTY API KEY: apiKey:""');
        } else {
            console.log('COULD NOT FIND apiKey PROPERTY AT ALL');
        }
    })
    .catch(console.error);
