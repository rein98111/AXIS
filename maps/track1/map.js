/* 0(右), 45, 90, 135, 180, 225, 270, 315) */

const track1Data = {
    info: {
        title: "PADORU / PADORU",
        artist: "Turbo",
		creator: "susFries",
        level: "02",
        color: "#00f2ff",
        cover: "maps/track1/cover.jpg",
        audio: "maps/track1/audio.ogg",
        preview: "maps/track1/preview.mp3",
        scrollSpeed: 0.0006
    },
    notes: [
        { time: 1347, angle: 0 },
		{ time: 1978, angle: 180 },
		{ time: 2610, endTime: 3221, angle: 90, type: "hold" },
		{ time: 3853, angle: 180 },
		{ time: 4485, angle: 0 },
		{ time: 5116, endTime: 5748, angle: 90, type: "hold" },
		{ time: 6379, angle: 45 },
		{ time: 7011, angle: 135 }, 
		{ time: 7642, endTime: 8274, angle: 225, type: "hold" },
		{ time: 8906, angle: 315 },
		{ time: 9537, angle: 225 },
		{ time: 10169, endTime: 10800, angle: 135, type: "hold" },
		{ time: 11116, angle: 0 },
		{ time: 11432, angle: 180 },
		{ time: 12064, angle: 0 },
		{ time: 12695, angle: 225 },
		{ time: 13011, angle: 270 },
		{ time: 13327, angle: 315 },
		{ time: 13958, angle: 0 },
		{ time: 14590, angle: 180 },
		{ time: 15221, angle: 315 },
		{ time: 15537, angle: 270 },
		{ time: 15853, angle: 225 },
    ]
};
window.currentTrack = track1Data;