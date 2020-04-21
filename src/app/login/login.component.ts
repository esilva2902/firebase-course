import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import * as firebaseui from 'firebaseui';
import * as firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {Router} from '@angular/router';


@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

    /**
     * 2. This is the FirebaseUI reference:
     */
    ui: firebaseui.auth.AuthUI;

    constructor(private afAuth: AngularFireAuth,
                private router:Router,
                private ngZone: NgZone) {

    }

    ngOnInit() {

        /**
         * 1. We must configure the library providing the following options:
         *    (a). signInOptions: these are all the authetication providers our app supports. 
         *         Remember that these providers must be enabled and configured in Firebase console.
         * 
         *    (b). callbacks: We have to provide the functions that is going to be called once the
         *         user has been signed in.
         */
        const uiConfig = {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            callbacks: {

                signInSuccessWithAuthResult: this
                    .onLoginSuccessful
                    .bind(this)
            }

        };

        /**
         * 3. FirebaseUi constructor needs a global reference to Firebase SDK Authentication service.
         *    We get the reference from AngularFireAuth service.
         */
        this.ui = new firebaseui.auth.AuthUI(this.afAuth.auth);

        /**
         * 4. Once FirebaseUI is instanciated we can start it passing the following parameters:
         *    (a). The css selector which correspond to the container where FirebaseUI will set 
         *         the authentication providers.
         *    (b). The configuration object with the desirable providers.
         */
        this.ui.start('#firebaseui-auth-container', uiConfig);


    }

    ngOnDestroy() {
        /**
         * 6. We must dispose the FirebaseUi instance because we will get an error saying
         *    that an intance already exist.
         */
        this.ui.delete();
    }

    onLoginSuccessful(result) {

        console.log("Firebase UI result:", result);

        /**
         * 5. Once the user has successfully logged in we have to redirect to the page we want
         *    the user starts its interaction. 
         * 
         *    Due to our page lives in our current SPA we have to do the redirection inside
         *    the Angular zone (NgZone) to allowing Angular runs change detection and then display
         *    the contents of /courses page.
         * 
         *    If we were not run the redirection inside the NgZone the content will not be presented 
         *    to the user.
         */
        this.ngZone.run(() => this.router.navigateByUrl('/courses'));

    }
}


