const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    console.log(myPeer,stream)
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        console.log(1)
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log(2)
        connectToNewUser(userId, stream)
    })

    
})

socket.on('user-disconnected', userId => {
    console.log(3)
    if (peers[userId]) peers[userId].close()
})




myPeer.on('open', id => {
    console.log(4)
    socket.emit('join-room', ROOM_ID, id)
})

// socket.on('user-connected', userId => {
//     console.log('User connected: ' + userId)
// })

function connectToNewUser(userId, stream) {
    console.log(5)
    const call = myPeer.call(userId, stream)
    console.log('new user from method')
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}