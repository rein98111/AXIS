window.currentTrack = {
    info: {
        title: "TUTORIAL - City",
        artist: "Gustaf Grefberg | BPM 123 | 02:10",
        creator: "susFries",
        level: "01",
        audio: "maps/tuto/audio.mp3",
        preview: "maps/tuto/audio.mp3",
        cover: "maps/tuto/cover.png",
        scrollSpeed: 0.0002 // 較慢的流速方便新手反應
    },
    notes: [
        // --- 1 ---
        { time: 2576, message: "Welcome to AXIS!" },
        { time: 6478, message: "This is the tutorial track." },
        { time: 10381, message: "Here, you will learn the basic mechanics." },
        { time: 14283, message: "No key restrictions in this game." },
        { time: 18186, message: "You can use ANY key on your keyboard." },
        { time: 22088, message: "First, let's learn how to 'Tap'." },
        { time: 25991, message: "Tap when the circle overlaps the center!" },
        { time: 29893, message: "Let's get started!" },
        
        // --- Tap (單擊) ---
        { time: 33195, angle: 270 },
        { time: 35147, angle: 90 },
        { time: 37098, angle: 180 },
        { time: 39049, angle: 0 },
        { time: 41000, angle: 225 },
        { time: 42952, angle: 45 },
        { time: 44903, angle: 315 },
        { time: 46854, angle: 135 },
        
        // --- 2 ---
        { time: 49405, message: "Great job! You've mastered 'Tap'." },
        { time: 53308, message: "Now, let's learn how to 'Hold'." },
        { time: 57210, message: "Hold the key, then release when it ends." },
        { time: 61113, message: "Ready? Go!" },
        
        // --- Hold (滑條) ---
        { time: 64415, endTime: 66366, angle:270 , type: "hold" },
        { time: 68317, endTime: 70269, angle:90 , type: "hold" },
        { time: 72220, endTime: 74171, angle:180 , type: "hold" },
        { time: 76122, endTime: 78073, angle:0 , type: "hold" },
        { time: 80025, endTime: 81976, angle:225 , type: "hold" },
        { time: 83927, endTime: 85878, angle:45 , type: "hold" },
        { time: 87830, endTime: 89781, angle:315 , type: "hold" },
        { time: 91732, endTime: 93683, angle:135 , type: "hold" },
        
        // --- 3 ---
        { time: 96234, message: "Excellent! You've learned the basics." },
        { time: 100137, message: "Every track has its own rhythm." },
        { time: 104039, message: "Watch out for multiple notes at once!" },
        { time: 107942, message: "Now, let's finish the song!" },
        
        // --- Outro (尾段) ---
        { time: 111244, angle: 270 },
        { time: 112220, angle: 90 },
        { time: 113195, angle: 180 },
        { time: 114171, angle: 0 },
        { time: 115147, endTime: 116222, angle:135 , type: "hold" },
        { time: 117098, endTime: 118173, angle:225 , type: "hold" },
        { time: 119049, angle: 0 },
        { time: 120025, angle: 90 },
        { time: 121000, angle: 180 },
        { time: 121976, angle: 270 },
        { time: 122952, endTime: 124027, angle:315 , type: "hold" },
        { time: 124903, endTime: 125978, angle:45 , type: "hold" },
        { time: 126866, message: "Double Tap!!" },
        { time: 126854, angle: 225 },{ time: 126954, angle: 315 },
        { time: 130369, type: "end" },
    ]
};
