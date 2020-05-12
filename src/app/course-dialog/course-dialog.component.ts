import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {Course} from "../model/course";
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import {CoursesService} from '../services/courses.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage} from '@angular/fire/storage';
import {Observable} from 'rxjs';
import {concatMap, last, tap} from 'rxjs/operators';


@Component({
    selector: 'course-dialog',
    templateUrl: './course-dialog.component.html',
    styleUrls: ['./course-dialog.component.css']
})
export class CourseDialogComponent implements OnInit {

    form: FormGroup;
    description:string;

    course: Course;

    uploadPercent$ : Observable<number>;

    downloadURL$: Observable<any>;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CourseDialogComponent>,
        @Inject(MAT_DIALOG_DATA) course:Course,
        private coursesService: CoursesService,
        private storage: AngularFireStorage) {

        /**
         * 1. Firstly, We have to inject the service AngularFireStorage 
         *    that will let us to manage the files which will be uploaded.
         */

        this.course = course;

        const titles = course.titles;

        this.form = fb.group({
            description: [titles.description, Validators.required],
            longDescription: [titles.longDescription,Validators.required]
        });

    }

    uploadFile(event) {

        /**
         * 2. Get the reference to the file the user wants to upload:
         */
        const file: File = event.target.files[0];

        /**
         * 3. Construct the destination path. This path is the path which 
         *    will live in Firebase Storage service.
         *
         */
        const filePath = `courses/${this.course.id}/${file.name}`;

        /**
         * 4. We have to get an uploaded task specifying the path we have
         *    created and the file reference we have get:
         */
        const task = this.storage.upload(filePath, file);

        /**
         * 5. Trigger the uploading operation:
         * 
         *      Since we want to display a progress indicator showing 
         *      the uploaded percentage we will invoke percentageChanges()
         *      observable. Finally, we subscribe to this cold observable 
         *      in the template directly.
         */
        this.uploadPercent$ = task.percentageChanges();

        /**
         * 6. Getting the Download URl from the just uploaded image:
         * 
         *      It is enough to provide the path of the file we want to get
         *      the download-url.
         * 
         *      It is important to notice that we have to get the download-url
         *      from the files that have already been uploaded to the Firebase Storage.
         *      That is why we are taking the last emitted value from snapshotChanges()
         *      observable via last() operator. snapshotChanges() observable will be
         *      emitting values until it finishes uploading the file. Once the file 
         *      has been saved in the storage we will be able to get its corresponding
         *      download-url via getDownloadURL() observable.
         * 
         */
        this.downloadURL$ = task.snapshotChanges().pipe(
            last(),
            concatMap(() => this.storage.ref(filePath).getDownloadURL())
        );

        // this.downloadURL$.subscribe(console.log);

        /**
         * 7. Once we have get the download-url we could save it to the database:
         */
        const saveUrl$ = this.downloadURL$.pipe(
            concatMap(url => this.coursesService.saveCourse(this.course.id, {
                uploadedImageUrl: url
            }))
        );

        saveUrl$.subscribe(console.log);
    }

    ngOnInit() {

    }


    save() {

        const changes = this.form.value;

        this.coursesService.saveCourse(this.course.id, {titles: changes})
            .subscribe((value) => {
                    console.log(`after editing a course: `, value);
                    
                    this.dialogRef.close(this.form.value)
                }
            );
    }

    close() {
        this.dialogRef.close();
    }

}






