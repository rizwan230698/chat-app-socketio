const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return { error: "username and room is required" };
  }

  const existingUser = users.find(
    (user) => user.username === username && user.room === room
  );

  if (existingUser) {
    return { error: "username is in use" };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  console.log(id);
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersinRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  users,
  addUser,
  removeUser,
  getUser,
  getUsersinRoom,
};
