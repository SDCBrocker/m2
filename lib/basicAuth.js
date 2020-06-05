const users = {
    exactech: {
        username: "exactech",
        password: 'eXa(tEc#p@$$w0rd'
    }
}

// validation function used for hapi-auth-basic
const validate = async function (request, username, password) {
    const user = users[username]
    if (!user) {
        return { isValid: false }
    }

    let isValid = true;
    if (password !== user.password)
        isValid = false;

    return { isValid, credentials: { username: user.username } }
}

module.exports = { validate }