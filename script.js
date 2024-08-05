$(document).ready(function() {
    $(".chat_wrapper")
        .css('cursor', 'pointer')
        .hover(
            function () {
                $(this).css('color', '#ffffff');
            },
            function () {
                $(this).css('color', '');
            }
        );

    let buttons = [
        '<button class="buttoninput" onclick="updateChat(\'projects\')" id="projects">Portfolio</button>',
        '<button class="buttoninput" onclick="updateChat(\'experience\')" id="experience">Experience</button>',
        '<button class="buttoninput" onclick="updateChat(\'aboutMe\')" id="aboutMe">Who are you?</button>',
        '<button class="buttoninput" onclick="updateChat(\'homeState\')" id="Nevermind">Nevermind</button>',
        '<button class="buttoninput" onclick="updateChat(\'other\')" id="Other">Archive</button>',
        '<button class="buttoninput" onclick="updateChat(\'projQ\')" id="projQ">Current Work</button>',
        '<button class="buttoninput" onclick="updateChat(\'otherQ\')" id="otherQ">What are these?</button>',
        '<button class="buttoninput" onclick="updateChat(\'resume\')" id="resume">Resume</button>',
        '<button class="buttoninput" onclick="updateChat(\'contact\')" id="contact">Contact</button>',
        '<button class="buttoninput" onclick="updateChat(\'fun\')" id="fun">Life</button>',
    ];

    let stateSpace = {
        'startState': {
            'buttons': [5, 0, 2],
            'botMessage': 'What would you like to see?',
            'moreQuestions': false
        },
        'homeState': {
            'buttons': [0, 2],
            'botMessage': 'Would you like to see anything else?',
            'userMessage': "Actually, nevermind lmao",
            'moreQuestions': false
        },
        // Add other states as needed
    };

    function createInput(buttonhtml) {
        var $input = $(buttonhtml);
        $input.appendTo($("#chat_input"));
    }

    function clearInput() {
        $('#chat_input').empty();
    }

    function newBotMessage(messageText) {
        let text = "You can read more about on our Storybook";
        if (messageText == "UI Library Storybook") {
            messageText = text.link("https://azure.github.io/communication-ui-library/?path=/story/overview--page");
        }
        var $input = $('<div class="agent">' + messageText + '</div>');
        $input.appendTo($('#chat_output'));
        $("#chat_output").scrollTop($("#chat_output")[0].scrollHeight);
    }

    function newUserMessage(messageText) {
        var $input = $('<div class="user">' + messageText + '</div>');
        $input.appendTo($('#chat_output'));
        $("#chat_output").scrollTop($("#chat_output")[0].scrollHeight);
    }

    async function updateChat(nextState) {
        console.log('updateChat called with state:', nextState); // Debugging statement
        if (!stateSpace[nextState]) {
            console.error('State not found:', nextState); // Debugging statement
            return;
        }
        clearInput();
        if (nextState != "startState") {
            newUserMessage(stateSpace[nextState]["userMessage"]);
        }
        await botType(stateSpace[nextState]["botMessage"]);
        if (stateSpace[nextState]["thumbnails"]) {
            toggler(stateSpace[nextState]["thumbnails"]);
        }
        stateSpace[nextState]["buttons"].forEach(element => {
            createInput(buttons[element]);
        });
    }

    async function botType(messageText) {
        var $input = $('<div class="agent waiting" id="agent_waiting"><div></div><div></div><div></div></div>');
        $input.appendTo($('#chat_output'));
        $("#chat_output").scrollTop($("#chat_output")[0].scrollHeight);
        setTimeout(function () {
            $("#agent_waiting").remove();
            newBotMessage(messageText);
        }, 1250);
        return new Promise(resolve => setTimeout(resolve, 1250));
    }

    updateChat("startState", true);
});
