import {InteractionModel} from "../alexa/interaction-model";
import {Alexa, AlexaResponseCallback} from "../alexa/alexa";

const DefaultIntentSchemaLocation = "speechAssets/IntentSchema.json";
const DefaultSampleUtterancesLocation = "speechAssets/SampleUtterances.txt";

/**
 * Programmatic interface for the speak command
 */
export class BSTSpeak {
    private _alexa: Alexa = null;

    public constructor(public skillURL: string,
                       public intentSchemaFile?: string,
                       public sampleUtterancesFile?: string,
                       public applicationID?: string) {
        if (this.intentSchemaFile === undefined || this.intentSchemaFile === null) {
            this.intentSchemaFile = DefaultIntentSchemaLocation;
        }

        if (this.sampleUtterancesFile === undefined || this.sampleUtterancesFile === null) {
            this.sampleUtterancesFile = DefaultSampleUtterancesLocation;
        }

        this._alexa = new Alexa();
    }

    public initialize(ready: (error?: string) => void) {
        let self = this;
        InteractionModel.fromFiles(this.intentSchemaFile, this.sampleUtterancesFile, function(model: InteractionModel, error: string) {
            if (error !== undefined && error !== null) {
                ready(error);
            } else {
                self._alexa.startSession(self.skillURL, model, true, self.applicationID);
                ready();
            }
        });
    }

    public speak(phrase: string, callback: AlexaResponseCallback) {
        this._alexa.spoken(phrase, function (request: any, response: any, error?: string) {
            callback(request, response, error);
        });
    }

    public on(eventType: string, listener: Function) {
        if (eventType.startsWith("AudioPlayer")) {

        }
    }
}
