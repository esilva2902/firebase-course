import {Component, OnInit, ViewEncapsulation} from '@angular/core';

import * as firebase from 'firebase/app';
import 'firebase/firestore';
import {Course} from '../model/course';
import {AngularFirestore} from '@angular/fire/firestore';
import {of} from 'rxjs';


@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    constructor(private db: AngularFirestore) {

    }

    ngOnInit() {
        this.db.collection('courses').valueChanges().subscribe(value => {
            console.log(`valueChanges() => courses collection: `, value);
        });

        this.db.collection('courses').snapshotChanges().subscribe(value => {
            console.log(`snapshotChanges() => courses collection: `, value);
        });

        this.db.collection('courses').stateChanges().subscribe(value => {
            console.log(`stateChanges() => courses collection: `, value);
        });
    }

    save() {

        const firebaseCourseRef =
            this.db.doc('/courses/HjBJsRWRtGAmauQSnHUh').ref;

        const rxjsCourseRef =
            this.db.doc('/courses/b7FhWMPuf6oN3RnHaqV9').ref;

        const batch = this.db.firestore.batch();

        batch.update(firebaseCourseRef, {titles: {description:'Firebase Course'}});

        batch.update(rxjsCourseRef, {titles: {description:'RxJs Course'}});

        const batch$ = of(batch.commit());

        batch$.subscribe();

    }

    async runTransaction() {

        const newCounter = await this.db.firestore
            .runTransaction(async transaction => {

            console.log('Running transaction...');

            const courseRef = this.db.doc('/courses/JVXlcA6ph98c7Vg2nc4E').ref;

            const snap = await transaction.get(courseRef);

            const course = <Course> snap.data();

            const lessonsCount =  course.lessonsCount + 1;

            transaction.update(courseRef, {lessonsCount});

            return lessonsCount;

        });

        console.log("result lessons count = ",newCounter);

    }

}
















