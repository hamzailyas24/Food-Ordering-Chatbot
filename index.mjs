import express from "express";
import Alexa, { SkillBuilders } from 'ask-sdk-core';
import morgan from "morgan";
import { ExpressAdapter } from 'ask-sdk-express-adapter';
import mongoose from 'mongoose';
import axios from "axios";

mongoose.connect('mongodb+srv://dbuser:dbpassword@cluster0.nr4e4.mongodb.net/chatbotdb?retryWrites=true&w=majority');

const Usage = mongoose.model('Usage', {
  skillName: String,
  clientName: String,
  createdOn: { type: Date, default: Date.now },
});

const app = express();
app.use(morgan('short'))

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log("a request came", req.body);
    next()
  })

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Fallback intent: Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {

    const speakOutput = 'Welcome to Food Application';
    const reprompt = 'I am your virtual assistant. you can ask for the menu';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(reprompt)
      .withSimpleCard("Kababjees", speakOutput)
      .getResponse();
  }
};
const introHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'intro';
    },
    handle(handlerInput) {
   
      const speakOutput = 'Your Name is Hamza Ilyas and you are the owner of Food Application Skill';
      const reprompt = 'I am your virtual assistant. you can ask for the menu';
  
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(reprompt)
        .getResponse();
    }
  };

const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    introHandler,
  )
  .addErrorHandlers(
    ErrorHandler
  )
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, false, false);

app.post('/api/v1/webhook-alexa', adapter.getRequestHandlers());

app.use(express.json())
app.get('/home', (req, res, next) => {
  res.send("This is a Home");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});