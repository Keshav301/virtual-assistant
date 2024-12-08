const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const voice = document.querySelector("#voice");

function speak(text, options = {}) {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || "hi-IN";

    utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event.error);
    };

    synth.speak(utterance);
}

function wishMe() {
    const hours = new Date().getHours();
    const greeting =
        hours < 12 ? "Good Morning Sir" :
        hours < 16 ? "Good Afternoon Sir" :
        "Good Evening Sir";
    speak(greeting);
}
wishMe();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false; 
recognition.interimResults = false; 
recognition.lang = "en-us";

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    content.innerText = transcript;
    takeCommand(transcript);
};

recognition.onerror = (event) => {
    console.error("Speech Recognition Error: ", event.error);
    speak("I'm sorry, there was an error. Please try again.");
};

recognition.onend = () => {
    
    btn.style.display = "flex"; 
    voice.style.display = "none";  
};

btn.addEventListener("click", () => {
    recognition.start();
    voice.style.display = "block";  
    btn.style.display = "none";  
});

function takeCommand(command) {
    voice.style.display = "none";
    btn.style.display = "flex";

    if (command.includes("hello") || command.includes("hey")) {
        speak("Hello Sir, How can I help you?");
    } 
    else if (command.includes("who are you")) {
        speak("I am a virtual assistant.");
    }
    
    else if (command.includes("open")) {
        openWebsite(command);
    } 
    else if (command.includes("time")) {
        const time = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        speak(`The time is ${time}`);
    } 
    else if (command.includes("date")) {
        const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" });
        speak(`Today's date is ${date}`);
    } 
    else if (command.includes("wikipedia")) {
        speak("Searching on Wikipedia...");
        var query = command.replace("wikipedia", "").trim();
        query = query.replace(/who is|what is|on|according to|According to|how to|tell me about/g, "").trim();

        if (!query) {
            speak("Please provide a valid query after saying Wikipedia.");
            return;
        }
        // console.log("Wikipedia Query:", query);
    
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.extract) {
                    const results = data.extract.split('. ').slice(0,3).join('. ') + '.';
                    
                    console.log("According to Wikipedia:", results);
                    speak("According to Wikipedia:");
                    speak(results);
                } else {
                    speak("I could not find anything on Wikipedia for your query.");
                }
            })
            .catch((error) => {
                console.error("Error fetching Wikipedia summary:", error.command);
                speak("I encountered an error while fetching data from Wikipedia.");
            });
    }
    
    else {
        searchOnline(command);
    }
}

function openWebsite(command) {
    const sites = {
        youtube: "https://youtube.com/",
        google: "https://google.com/",
        facebook: "https://facebook.com/",
        instagram: "https://instagram.com/",
        whatsapp: "whatsapp://",
        calculator: "calculator://"
    };

    const site = Object.keys(sites).find(key => command.includes(key));
    if (site) {
        speak(`Opening ${site}...`);
        window.open(sites[site], "_blank");
    } else {
        speak("I couldn't recognize the website.");
    }
}


function searchOnline(command) {
    speak(`This is what I found on the internet regarding ${command}.`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`, "_blank");
}
