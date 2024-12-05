const MDB = require('./DBInterface');

async function main() {
    const db = new MDB();

    await db.new_user({
        'name': 'Garrett Scott',
        'username': 'greatScott',
        'passwordHash' : '',
        'wins': 0,
        'losses': 1

    });

    await db.get_user('greatScott');
}

main();
