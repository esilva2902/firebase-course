import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    isLoggedIn$: Observable<boolean>;

    isLoggedOut$:Observable<boolean>;

    pictureUrl$: Observable<string>;

    constructor(private afAuth: AngularFireAuth) {

        /**
         * 1. Firstly, inject the service we need to manange 
         * the authenticated user: AngularFireAuth
         */

    }

    ngOnInit() {

        /**
         * 2. authState observable watches for the autheticated user.
         *    If the user log out the authState observable will emit null:
         */
        this.afAuth.authState.subscribe(user => console.log(user));

        this.isLoggedIn$ = this.afAuth.authState.pipe(map(user => !!user));

        this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));

        this.pictureUrl$ =
            this.afAuth.authState.pipe(map(user => user ? user.photoURL: null));
    }

    logout() {

        this.afAuth.auth.signOut();

    }

}
