import { Injectable } from '@angular/core';

declare class TokenizeJs {
    constructor(businessId: string, applicationId: string);

    mount(cardElement: string, document: any, options: any): any;

    getNonce(noncePayload: { businessId: string }): { "nonce": string };

    on(eventName: string, callback: (event: any) => any): any
}

@Injectable({ providedIn: 'root' })
export class PoyntService {

    public collect: TokenizeJs;
    public options: any;
    private poyntCollect: HTMLScriptElement;
    private businessId = '74111f41-4293-4eee-b221-566fb24e79a6';
    private applicationId = 'urn:aid:64c402a3-c354-4ae3-8077-cddcc8b2266e';

    constructor() {
        this.options = {
            // customCSS: {
            // },
            iFrame: {
                width: "270px",
                height: "100px",
                border: "0"
            },
            fieldWrapper: {
                base: `margin-bottom: 1rem;`
            },

            displayComponents: {
                firstName: false, // toggle these to true if you wish to show the forms
                lastName: false,
                emailAddress: false,
                submitButton: false,
                showEndingPage: true,
                labels: false
            },
            fields: {
                emailAddress: "",
                firstName: "",
                lastName: ""
            },
            additionalFieldsToValidate: ["firstName", "lastName"] // fields to validate
        }
    }

    createPoyntScript(
        htmlElementId: string,
        storeInformation: any,
        onReady?: (event?: any) => void,
        onGetNonce?: (event?: any) => void,
        onError?: (event?: any) => void,
        customer?: any
    ) {
        this.poyntCollect = document.createElement("script");
        this.poyntCollect.src = "https://poynt.net/snippet/poynt-collect/bundle.js";
        this.poyntCollect.async = true;
        this.poyntCollect.onload = () => {

            const poyntIntegration = storeInformation.integrations.find(int => int.name === 'POYNT');

            this.businessId = poyntIntegration.businessId;

            if (customer) {
                this.options.fields.firstName = customer?.customerFirstName;
                this.options.fields.lastName = customer?.customerLastName;
                this.options.fields.emailAddress = customer?.customerEmail;

                this.options.displayComponents.firstName = false;
                this.options.displayComponents.lastName = false;
                this.options.displayComponents.emailAddress = false;
            } else {
                this.options.displayComponents.firstName = true;
                this.options.displayComponents.lastName = true;
                this.options.displayComponents.emailAddress = true;
                this.options.fields.firstName = '';
                this.options.fields.lastName = '';
                this.options.fields.emailAddress = '';
            }

            this.collect = new TokenizeJs(this.businessId, this.applicationId);
            this.collect.mount(htmlElementId, document, this.options);

            this.onReady(onReady);
            this.onGetNonce(onGetNonce);
            this.onError(onError);

        }

        document.head && document.head.appendChild(this.poyntCollect);
    }

    getNonce() {
        this.collect.getNonce({ businessId: this.businessId });
    }

    onReady(callBack: (event?: any) => void) {
        this.collect.on("ready", callBack);
    }

    onGetNonce(callBack: (event?: any) => void) {
        this.collect.on("nonce", callBack);
    }

    onError(callBack: (event?: any) => void) {
        this.collect.on("error", callBack);
    }

    destroyPoyntScript() {
        console.log('POYNT SCRIPT DESTROYED');
        document.head.removeChild(this.poyntCollect);
        this.collect = undefined;
        this.businessId = undefined;
    }


}