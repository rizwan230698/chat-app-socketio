const socket = io();

//Elements
const $messageForm = document.getElementById("messageForm");
const $msgBtn = document.getElementById("msg-btn");
const $messageFormInput = document.querySelector("input");
const $locationButton = document.getElementById("send-location");
const $messageList = document.querySelector(".messages");
const $sidebar = document.querySelector(".sidebar");
const $userList = document.querySelector(".users");
const $hamBurger = document.querySelector(".hamburger");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newMessage = e.target.elements.message.value;
  if (newMessage) {
    $msgBtn.setAttribute("disabled", "disabled");
    socket.emit("sendMessage", newMessage, (error) => {
      $messageFormInput.value = "";
      $messageFormInput.focus();
      $msgBtn.removeAttribute("disabled");
    });
  }
});
socket.on("message", (message) => {
  const newListItem = document.createElement("li");
  newListItem.innerHTML = `
  <h4 class="username">${message.username}</h4>
  <span class="content">${message.text}</span>
  <span class="time">${moment(message.createdAt).format("h:mm a")}</span>
  `;
  $messageList.appendChild(newListItem);
  $messageList.scrollTo(0, $messageList.scrollHeight);
});

$locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $locationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const {
      coords: { latitude, longitude },
    } = position;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      $locationButton.removeAttribute("disabled");
    });
  });
});

socket.on("location", (location) => {
  const newListItem = document.createElement("li");
  newListItem.innerHTML = `
  <h4 class="username">${location.username}</h4>
  <a class="content" href=${
    location.url
  } target="_blank">My current location</a>
  <span class="time">${moment(location.createdAt).format("h:mm a")}</span>
  
  `;
  $messageList.appendChild(newListItem);
  $messageList.scrollTo(0, $messageList.scrollHeight);
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);

    window.location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  $userList.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    let newItem = document.createElement("li");
    let newContent = document.createTextNode(users[i].username);
    newItem.appendChild(newContent);

    $userList.appendChild(newItem);
  }
});

$hamBurger.addEventListener("click", () => {
  if ($sidebar.clientWidth === 0) {
    $sidebar.classList.add("sidebar-mob");
    $hamBurger.innerHTML = `<i class="fa fa-times"></i>`;
  } else {
    $sidebar.classList.remove("sidebar-mob");
    $hamBurger.innerHTML = `<i class="fa fa-bars"></i>`;
  }
});
