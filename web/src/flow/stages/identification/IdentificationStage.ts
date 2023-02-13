import "@goauthentik/elements/Divider";
import "@goauthentik/elements/EmptyState";
import "@goauthentik/elements/forms/FormElement";
import { BaseStage } from "@goauthentik/flow/stages/base";

import { t } from "@lingui/macro";

import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement } from "lit/decorators.js";

import AKGlobal from "@goauthentik/common/styles/authentik.css";
import PFAlert from "@patternfly/patternfly/components/Alert/alert.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFLogin from "@patternfly/patternfly/components/Login/login.css";
import PFTitle from "@patternfly/patternfly/components/Title/title.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import {
    IdentificationChallenge,
    IdentificationChallengeResponseRequest,
    LoginSource,
    UserFieldsEnum,
} from "@goauthentik/api";

export const PasswordManagerPrefill: {
    password: string | undefined;
    totp: string | undefined;
} = {
    password: undefined,
    totp: undefined,
};

export const OR_LIST_FORMATTERS = new Intl.ListFormat("default", {
    style: "short",
    type: "disjunction",
});

@customElement("ak-stage-identification")
export class IdentificationStage extends BaseStage<
    IdentificationChallenge,
    IdentificationChallengeResponseRequest
> {
    form?: HTMLFormElement;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFAlert,
            PFLogin,
            PFForm,
            PFFormControl,
            PFTitle,
            PFButton,
            AKGlobal,
        ].concat(
            css`
                /* login page's icons */
                .pf-c-login__main-footer-links-item button {
                    background-color: transparent;
                    border: 0;
                    display: flex;
                    align-items: stretch;
                }
                .pf-c-login__main-footer-links-item img {
                    fill: var(--pf-c-login__main-footer-links-item-link-svg--Fill);
                    width: 100px;
                    max-width: var(--pf-c-login__main-footer-links-item-link-svg--Width);
                    height: 100%;
                    max-height: var(--pf-c-login__main-footer-links-item-link-svg--Height);
                }
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
                .pf-c-button.pf-m-primary:hover, .pf-c-button.pf-m-primary:focus{
                    background-color: #0a48ff;
                }
                .pf-c-form__group.pf-m-action{
                    margin-top: 0;
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
            `,
        );
    }

    firstUpdated(): void {
        this.form = document.createElement("form");
        document.documentElement.appendChild(this.form);
        // Only add the additional username input if we're in a shadow dom
        // otherwise it just confuses browsers
        if (!("ShadyDOM" in window)) {
            // This is a workaround for the fact that we're in a shadow dom
            // adapted from https://github.com/home-assistant/frontend/issues/3133
            const username = document.createElement("input");
            username.setAttribute("type", "text");
            username.setAttribute("name", "username"); // username as name for high compatibility
            username.setAttribute("autocomplete", "username");
            username.onkeyup = (ev: Event) => {
                const el = ev.target as HTMLInputElement;
                (this.shadowRoot || this)
                    .querySelectorAll<HTMLInputElement>("input[name=uidField]")
                    .forEach((input) => {
                        input.value = el.value;
                        // Because we assume only one input field exists that matches this
                        // call focus so the user can press enter
                        input.focus();
                    });
            };
            this.form.appendChild(username);
        }
        const password = document.createElement("input");
        password.setAttribute("type", "password");
        password.setAttribute("name", "password");
        password.setAttribute("autocomplete", "current-password");
        password.onkeyup = (ev: KeyboardEvent) => {
            if (ev.key == "Enter") {
                this.submitForm(ev);
            }
            const el = ev.target as HTMLInputElement;
            // Because the password field is not actually on this page,
            // and we want to 'prefill' the password for the user,
            // save it globally
            PasswordManagerPrefill.password = el.value;
            // Because password managers fill username, then password,
            // we need to re-focus the uid_field here too
            (this.shadowRoot || this)
                .querySelectorAll<HTMLInputElement>("input[name=uidField]")
                .forEach((input) => {
                    // Because we assume only one input field exists that matches this
                    // call focus so the user can press enter
                    input.focus();
                });
        };
        this.form.appendChild(password);
        const totp = document.createElement("input");
        totp.setAttribute("type", "text");
        totp.setAttribute("name", "code");
        totp.setAttribute("autocomplete", "one-time-code");
        totp.onkeyup = (ev: KeyboardEvent) => {
            if (ev.key == "Enter") {
                this.submitForm(ev);
            }
            const el = ev.target as HTMLInputElement;
            // Because the totp field is not actually on this page,
            // and we want to 'prefill' the totp for the user,
            // save it globally
            PasswordManagerPrefill.totp = el.value;
            // Because totp managers fill username, then password, then optionally,
            // we need to re-focus the uid_field here too
            (this.shadowRoot || this)
                .querySelectorAll<HTMLInputElement>("input[name=uidField]")
                .forEach((input) => {
                    // Because we assume only one input field exists that matches this
                    // call focus so the user can press enter
                    input.focus();
                });
        };
        this.form.appendChild(totp);
    }

    cleanup(): void {
        if (this.form) {
            this.form.remove();
        }
    }

    renderSource(source: LoginSource): TemplateResult {
        let icon = html`<i class="fas fa-share-square" title="${source.name}"></i>`;
        if (source.iconUrl) {
            icon = html`<img src="${source.iconUrl}" alt="${source.name}" />`;
        }
        return html`<li class="pf-c-login__main-footer-links-item">
            <button
                type="button"
                @click=${() => {
                    if (!this.host) return;
                    this.host.challenge = source.challenge;
                }}
                class=${this.challenge.showSourceLabels ? "pf-c-button pf-m-link" : ""}
            >
                <span class="pf-c-button__icon pf-m-start">${icon}</span>
                ${this.challenge.showSourceLabels ? source.name : ""}
            </button>
        </li>`;
    }

    renderFooter(): TemplateResult {
        if (!this.challenge?.enrollUrl && !this.challenge?.recoveryUrl) {
            return html``;
        }
        return html`<div class="pf-c-login__main-footer-band">
            ${this.challenge.enrollUrl
                ? html`<p class="pf-c-login__main-footer-band-item">
                      ${t`Need an account?`}
                      <a id="enroll" href="${this.challenge.enrollUrl}">${t`Sign up.`}</a>
                  </p>`
                : html``}
            ${this.challenge.recoveryUrl
                ? html`<p class="pf-c-login__main-footer-band-item">
                      <a id="recovery" href="${this.challenge.recoveryUrl}"
                          >${t`Forgot username or password?`}</a
                      >
                  </p>`
                : html``}
        </div>`;
    }

    renderInput(): TemplateResult {
        let type = "text";
        if (!this.challenge?.userFields || this.challenge.userFields.length === 0) {
            return html`<p>${t`Select one of the sources below to login.`}</p>`;
        }
        const fields = (this.challenge?.userFields || []).sort();
        // Check if the field should be *only* email to set the input type
        if (fields.includes(UserFieldsEnum.Email) && fields.length === 1) {
            type = "email";
        }
        const uiFields: { [key: string]: string } = {
            [UserFieldsEnum.Username]: t`Username`,
            [UserFieldsEnum.Email]: t`Email`,
            [UserFieldsEnum.Upn]: t`UPN`,
        };
        const label = OR_LIST_FORMATTERS.format(fields.map((f) => uiFields[f]));
        // console.log(label);
        return html`<ak-form-element
                label="${t`Email address`}"
                ?required="${true}"
                class="pf-c-form__group"
                .errors=${(this.challenge.responseErrors || {})["non_field_errors"]}
            >
                <!-- @ts-ignore -->
                <div class="input-item">
                    <i class="fa fa-envelope first" style="color: #9CA3AF;"></i>
                    <input
                        type=${type}
                        name="uidField"
                        placeholder="${t`you@example.com`}"
                        autofocus=""
                        autocomplete="username"
                        class="pf-c-form-control"
                        required
                    />
                    <i class="fa fa-exclamation-circle last" style="color: #DB232C;"></i>
                </div>
            </ak-form-element>
            ${this.challenge.passwordFields
                ? html`
                      <ak-form-element
                          label="${t`Password`}"
                          ?required="${true}"
                          class="pf-c-form__group"
                          .errors=${(this.challenge.responseErrors || {})["password"]}
                      >
                          <input
                              type="password"
                              name="password"
                              placeholder="${t`Password`}"
                              autocomplete="current-password"
                              class="pf-c-form-control"
                              required
                              value=${PasswordManagerPrefill.password || ""}
                          />
                      </ak-form-element>
                  `
                : html``}
            <div class="pf-c-form__group pf-m-action">
                <button type="submit" class="pf-c-button pf-m-primary pf-m-block">
                    ${this.challenge.primaryAction}
                </button>
            </div>
            ${this.challenge.passwordlessUrl
                ? html`<ak-divider>${t`Or`}</ak-divider>
                      <div>
                          <a
                              href=${this.challenge.passwordlessUrl}
                              class="pf-c-button pf-m-secondary pf-m-block"
                          >
                              ${t`Use a security key`}
                          </a>
                      </div>`
                : html``}`;
    }

    render(): TemplateResult {
        if (!this.challenge) {
            return html`<ak-empty-state ?loading="${true}" header=${t`Loading`}> </ak-empty-state>`;
        }
        return html`
            <div class="pf-c-login__main-body">
                <h3 class="pf-c-login-title">${this.challenge?.flowInfo?.title}</h3>
                <form
                    class="pf-c-form"
                    @submit=${(e: Event) => {
                        this.submitForm(e);
                    }}
                >
                    ${this.challenge.applicationPre
                        ? html`<p>${t`Login to continue to ${this.challenge.applicationPre}.`}</p>`
                        : html``}
                    ${this.renderInput()}
                </form>
            </div>`;
            // <footer class="pf-c-login__main-footer">
            //     <ul class="pf-c-login__main-footer-links">
            //         ${(this.challenge.sources || []).map((source) => {
            //             return this.renderSource(source);
            //         })}
            //     </ul>
            //     ${this.renderFooter()}
            // </footer>`;
    }
}
