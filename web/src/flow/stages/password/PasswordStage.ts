import { FormElement } from './../../../elements/forms/FormElement';
import { Form } from '@goauthentik/elements/forms/Form';
import "@goauthentik/elements/EmptyState";
import "@goauthentik/elements/forms/FormElement";
import "@goauthentik/flow/FormStatic";
import { BaseStage } from "@goauthentik/flow/stages/base";
import { PasswordManagerPrefill } from "@goauthentik/flow/stages/identification/IdentificationStage";

import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import AKGlobal from "@goauthentik/common/styles/authentik.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFLogin from "@patternfly/patternfly/components/Login/login.css";
import PFTitle from "@patternfly/patternfly/components/Title/title.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { PasswordChallenge, PasswordChallengeResponseRequest } from "@goauthentik/api";

@customElement("ak-stage-password")
export class PasswordStage extends BaseStage<PasswordChallenge, PasswordChallengeResponseRequest> {
    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFLogin,
            PFForm,
            PFFormControl,
            PFButton,
            PFTitle,
            AKGlobal,
            css`
                .pf-c-login-title{
                    font-family: 'Inter';
                    font-weight: 800;
                    font-size: 30px;
                    line-height: 36px;
                    text-align: center;
                    color: #1A2138;
                    margin-bottom: 2rem;
                }
                .pf-c-login__main-body{
                    padding-top: 2rem;
                    padding-bottom: 4rem;
                }
                @media (max-width: 767px) {
                    .pf-c-login-title{
                        font-size: 24px;
                    }
                }
                .pf-c-form-control, .pf-c-form-control:disabled{
                    box-shadow: 0 1px 2px 0 rgb(0, 0, 0, .05);
                    padding: 0 40px;
                    background-color: #FFFFFF;
                    border: 1px solid #EDF1F7;
                    border-radius: 6px;
                    margin-top: 0.25rem;
                    height: 48px !important;
                    line-height: 48px;
                }
                .pf-c-form-control{
                    color: #1A2138;
                }
                .pf-c-form-control:disabled{
                    color: #a4a4a4;
                }
                .pf-c-form-control:focus{
                    padding: 0 40px;
                    border-bottom-width: 1px;
                    outline-color: #3366FF;
                }
                input::input-placeholder{
                    color:#8F9BB3 !important;
                }
                input::-webkit-input-placeholder{
                    color:#8F9BB3 !important;
                }
                input::-moz-placeholder{   /* Mozilla Firefox 19+ */
                    color:#8F9BB3 !important;
                }
                input:-moz-placeholder{    /* Mozilla Firefox 4 to 18 */
                    color:#8F9BB3 !important;
                }
                input:-ms-input-placeholder{  /* Internet Explorer 10-11 */ 
                    color:#8F9BB3 !important;
                }
                .pf-c-button.pf-m-primary{
                    padding: 0;
                    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
                    border-radius: 6px;
                    height: 48px;
                    line-height: 48px;
                    background-color: #3366FF;
                }
                .pf-c-button.pf-m-primary:disabled{
                    background-color: rgba(51, 102, 255, 0.5);
                    color: #FFFFFF;
                }
                .pf-c-button.pf-m-primary:hover, .pf-c-button.pf-m-primary:focus{
                    background-color: #0a48ff;
                }
                .pf-c-form__group.pf-m-action{
                    margin-top: 0;
                }
                .pf-c-form__label{
                    display: flex;
                    justify-content: space-between;
                }
                .pf-c-form__label a{
                    color: #3366FF;
                }
                .input-item{
                    position: relative;
                }
                .input-item .first{
                    position: absolute;
                    left: 15px;
                    top: 20px;
                }
                .input-item .last{
                    position: absolute;
                    right: 15px;
                    top: 20px;
                    display: none;
                }
                .input-item.error .pf-c-form-control{
                    color: #DB2E33 !important;
                    border-color: #FF9C82 !important;
                }
                .input-item.error .pf-c-form-control:focus{
                    outline-color: #FF9C82 !important;
                }
                .input-item.error .last{
                    display: block;
                }
                .pf-c-form__label-text{
                    color: #53607A;
                    font-weight: 500;
                }
                @media (prefers-color-scheme: dark){
                    .pf-c-login-title{
                        color: var(--pf-global--palette--black-500);
                    }
                    .pf-c-form__label-text{
                        color: var(--pf-global--palette--black-500);
                    }
                }
            `,
        ];
    }

    input?: HTMLInputElement;

    timer?: number;
    // 
    @property({ type: Boolean })
    hasErrors?: boolean;
    // 
    @property({ type: Boolean })
    hasDisabled?: boolean;
    // 
    @property({ attribute: false })
    loading?: boolean;

    constructor() {
        super();
        this.hasErrors = false;
        this.hasDisabled = true;
    }

    renderInput(): HTMLInputElement {
        this.input = document.createElement("input");
        this.input.type = "password";
        this.input.name = "password";
        this.input.placeholder = t`Please enter your password`;
        this.input.autofocus = true;
        this.input.autocomplete = "current-password";
        this.input.classList.add("pf-c-form-control");
        this.input.required = true;
        this.input.value = PasswordManagerPrefill.password || "";
        // 
        this.input.oninput=()=>{
            if(this.hasErrors) this.hasErrors = false;
        };
        // This is somewhat of a crude way to get autofocus, but in most cases the `autofocus` attribute
        // isn't enough, due to timing within shadow doms and such.
        this.timer = window.setInterval(() => {
            if (!this.input) {
                return;
            }
            // Because activeElement behaves differently with shadow dom
            // we need to recursively check
            const rootEl = document.activeElement;
            const isActive = (el: Element | null): boolean => {
                if (!rootEl) return false;
                if (!("shadowRoot" in rootEl)) return false;
                if (rootEl.shadowRoot === null) return false;
                if (rootEl.shadowRoot.activeElement === el) return true;
                return isActive(rootEl.shadowRoot.activeElement);
            };
            if (isActive(this.input)) {
                this.cleanup();
            }
            this.input.focus();
        }, 10);
        console.debug("authentik/stages/password: started focus timer");
        return this.input;
    }

    cleanup(): void {
        if (this.timer) {
            console.debug("authentik/stages/password: cleared focus timer");
            window.clearInterval(this.timer);
        }
    }

    render(): TemplateResult {
        // console.log(this.challenge);
        if (!this.challenge) {
            return html`<ak-empty-state ?loading="${true}" header=${t`Loading`}> </ak-empty-state>`;
        }
        return html`
            <div class="pf-c-login__main-body">
                <h3 class="pf-c-login-title">${this.challenge?.flowInfo?.title}</h3>
                <form
                    class="pf-c-form"
                    @submit=${(e: Event) => {
                        this.submitForm(e).finally(() => {
                            if(!this.hasErrors) this.hasErrors = true;
                        });
                    }}
                >
                    <input
                        name="username"
                        autocomplete="username"
                        type="hidden"
                        value="${this.challenge.pendingUser}"
                    />
                    <div class="pf-c-form__group">
                        <label class="pf-c-form__label">
                            <span class="pf-c-form__label-text">${t`Username`}</span>
                            <a href="${ifDefined(this.challenge.flowInfo?.cancelUrl)}">${t`Not you?`}</a>
                        </label>
                        <div class="input-item">
                            <i class="fas fa-user first" style="color: #9CA3AF;"></i>
                            <input class="pf-c-form-control" disabled value="${this.challenge.pendingUser}"/>
                        </div>
                    </div>
                    <ak-form-element
                        label="${t`Password`}"
                        ?required="${true}"
                        class="pf-c-form__group"
                        .errors=${(this.challenge?.responseErrors || {})["password"]}
                    >
                        <div class="input-item ${this.hasErrors ? "error" : ""}">
                            <i class="fas fa-lock first" style="color: #9CA3AF;"></i>
                            <input
                                type="password"
                                name="password"
                                placeholder="${t`Please enter your password`}"
                                autofocus=""
                                autocomplete="current-password"
                                class="pf-c-form-control"
                                required
                                @input=${(e: InputEvent) => {
                                    if ((e.currentTarget as HTMLInputElement).value) {
                                        if(this.hasDisabled) this.hasDisabled = false;
                                    } else {
                                        if(!this.hasDisabled) this.hasDisabled = true;
                                    }
                                    if(this.hasErrors) this.hasErrors = false;
                                }}
                            />
                            <i class="fa fa-exclamation-circle last" style="color: #DB232C;"></i>
                        </div>
                    </ak-form-element>

                    ${this.challenge.recoveryUrl
                        ? html`<a href="${this.challenge.recoveryUrl}"> ${t`Forgot password?`}</a>`
                        : ""}

                    <div class="pf-c-form__group pf-m-action">
                        <button type="submit" class="pf-c-button pf-m-primary pf-m-block" ?disabled=${this.hasDisabled || this.loading}>
                            ${t`Continue`}
                            ${this.loading ? html`<i class="fa fa-spinner fa-spin" style="vertical-align: -1px;margin-left: 5px;"></i>`:""}
                        </button>
                    </div>
                </form>
            </div>`;
            // <footer class="pf-c-login__main-footer">
            //     <ul class="pf-c-login__main-footer-links"></ul>
            // </footer>`;
    }
}
