const Discord = require('discord.js');
const { OpenAIAPI } = require('openai');

const client = new Discord.Client();
const openai = new OpenAIAPI('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'); // Replace with your OpenAI API key
const token = 'MTE3NTM1MzExNjExMjE5MTU1OQ.GqAE_m.JI_q35x7wCmPco28g0h7wUaxMs2sDtqqqqiTuc'; // Replace with your Discord bot token
const requiredRole = '1165340571737530390'; // Replace with the ID of the role you want to assign

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
    try {
        // Send a welcome DM to new members
        member.send('Welcome to the server! I will ask you a few questions to get to know you better.');

        // Ask onboarding questions using GPT
        const onboardingQuestions = [
            'What is your age?',
            'What are your interests or hobbies?',
            'Where are you from?',
            'Tell us a fun fact about yourself.',
            // Add more questions as needed
        ];

        for (const question of onboardingQuestions) {
            // Ask the question using GPT-3
            const gptResponse = await openai.complete({
                engine: 'text-davinci-003', // You can experiment with other engines
                prompt: question,
                max_tokens: 50, // Adjust as needed
            });

            // Send the GPT response as a question
            await member.send(gptResponse.data.choices[0].text.trim());

            // Wait for user response (you may need to implement a message collector)
            // For simplicity, you can wait for a certain amount of time or a specific command
            const responseCollector = await member.dmChannel.awaitMessages({ max: 1, time: 300000, errors: ['time'] }); // 5 minutes timeout
            const userResponse = responseCollector.first();

            // Check if the response includes an age and if it's under 18
            const age = parseInt(userResponse.content);
            if (isNaN(age) || age < 18) {
                await member.send('Sorry, but users under 18 are not allowed in this server. You will be kicked.');
                await member.kick('User is under 18.');
                return;
            }
        }

        // If the user passed the age verification, assign the required role
        const role = member.guild.roles.cache.get(requiredRole);
        if (role) {
            await member.roles.add(role);
        }

        member.send('Thank you for answering the questions! You are now part of the community.');
    } catch (error) {
        console.error('Error:', error.message);
    }
});

client.login(token);
