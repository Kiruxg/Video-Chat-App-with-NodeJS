//JS for front-end
const socket = io("/")
const videoGrid = document.getElementById("video-grid")
const myVideo = document.createElement("video")
myVideo.muted = true

var myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3001"
})
const peers = {}

let myVideoStream
// eslint-disable-next-line promise/catch-or-return
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  // eslint-disable-next-line promise/always-return
  .then(stream => {
    console.log("my stream", stream)
    //my video connection
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    //they call us after connecting, we add their stream to view
    myPeer.on("call", call => {
      console.log("answered the call: ", call)
      call.answer(stream)
      console.log("call answer pass")
      const video = document.createElement("video")
      call.on("stream", userVideoStream => {
        console.log("their stream", userVideoStream)
        addVideoStream(video, userVideoStream)
      })
    })

    //when someone else connects
    socket.on("user-connected", userId => {
      console.log("user connected")
      setTimeout(function () {
        connectToNewUser(userId, stream)
      }, 1000)
    })

    socket.on("createMessage", message => {
      console.log("message from our server", message)
      const newMessage = document.createElement("li")
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`)
      console.log("updated message", newMessage)
      scrollToBottom()
    })
  })
//connect to server and get user ID
myPeer.on("open", id => {
  socket.emit("join-room", ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
  console.log("The stream: ", stream)
  console.log("User ID: ", userId)
  const call = myPeer.call(userId, stream)
  const video = document.createElement("video")
  call.on("stream", userVideoStream => {
    console.log("received their stream")
    addVideoStream(video, userVideoStream)
  })
  call.on("close", () => {
    video.remove()
  })

  peers[userId] = call
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    video.play()
  })
  videoGrid.append(video)
}
let text = $("input")
$("html").keydown(e => {
  // eslint-disable-next-line eqeqeq
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val())
    text.val("")
  }
})
const scrollToBottom = () => {
  let d = $(".main__chat_window")
  d.scrollTop(d.prop("scrollHeight"))
}
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false
    setUnmuteButton()
  } else {
    setMuteButton()
    myVideoStream.getAudioTracks()[0].enabled = true
  }
}

const playStop = () => {
  console.log("object")
  let enabled = myVideoStream.getVideoTracks()[0].enabled
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector(".main__mute_button").innerHTML = html
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector(".main__mute_button").innerHTML = html
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector(".main__video_button").innerHTML = html
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector(".main__video_button").innerHTML = html
}
// URL Copy To Clipboard
document.getElementById("invite-button").addEventListener("click", getURL)

function getURL() {
  console.log("test1")
  const c_url = window.location.href
  copyToClipboard(c_url)
  // eslint-disable-next-line no-alert
  alert("Url Copied to Clipboard,\nShare it with your Friends!\nUrl: " + c_url)
}

function copyToClipboard(text) {
  console.log("test2")
  var dummy = document.createElement("textarea")
  document.body.appendChild(dummy)
  dummy.value = text
  dummy.select()
  document.execCommand("copy")
  document.body.removeChild(dummy)
}
// End Call
// document
//   .getElementById("leave_meetingButton")
//   .addEventListener("click", ()=>{
//     socket.emit("user-disconnected")
//   });

//   socket.on("user-disconnected", (userId) => {
//     console.log("New User Disconnected");
//     if (peers[userId]) peers[userId].close();
//   });
// function endCall() {
//   // window.location.href = "/";

// }
document.getElementById("end-button").addEventListener("click", endCall)

function endCall() {
  window.location.href = "/"
}

$(document).ready(function () {
  $("#chat-toggle").click(function () {
    if (!$(".main__right").hasClass("main__right-toggle")) {
      $(".main__right").addClass("main__right-toggle")
    } else {
      $(".main__right").removeClass("main__right-toggle")
    }
  })
  window.addEventListener("click", function (e) {
    if ($(".main__right").hasClass("main__right main__right-toggle")) {
      if (document.getElementById("clickbox").contains(e.target)) {
        // Clicked in box
      } else {
        if (!document.getElementById("chat-toggle").contains(e.target)) {
          $(".main__right").removeClass("main__right-toggle")
        }
      }
    }
  })
})
