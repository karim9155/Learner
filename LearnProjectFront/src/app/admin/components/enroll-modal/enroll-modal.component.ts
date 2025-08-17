// karim9155/learner/Learner-fc5557b9b5123c3ec285bf8abc7969b10e56450d/LearnProjectFront/src/app/admin/components/enroll-modal/enroll-modal.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService, User } from '../../../services/user.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-enroll-modal',
  standalone: false,
  templateUrl: './enroll-modal.component.html',
  styleUrls: ['./enroll-modal.component.css']
})
export class EnrollModalComponent implements OnInit {

  employees: User[] = [];
  form: FormGroup;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<EnrollModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { courseId: string,   courseName: string },
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      selectAll: [false],
      learnerIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    // Call the same service method as the user management tab.
    // We request a large page size to get all employees.
    this.userService.getEmployees(0, 1000, '').subscribe({
      next: (response) => {
        // The user list is inside the 'content' property of the response.
        this.employees = response.content;

        // Clear any existing form controls before adding new ones
        this.learnerIds.clear();

        // Create a checkbox for each employee
        this.employees.forEach(() => {
          (this.form.get('learnerIds') as FormArray).push(new FormControl(false));
        });
      },
      error: (err) => {
        console.error('Failed to load employees for modal', err);
        this.snackBar.open('Could not load the employee list.', 'Close', { duration: 3000 });
      }
    });
  }

  onSelectAllChange(event: any): void {
    const isChecked = event.checked;
    this.learnerIds.controls.forEach(control => control.setValue(isChecked));
  }

  get learnerIds(): FormArray {
    return this.form.get('learnerIds') as FormArray;
  }

  onEnroll(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const selectedLearnerIds = this.form.value.learnerIds
      .map((checked: boolean, i: number) => checked ? this.employees[i].id : null)
      .filter((id: string | null) => id !== null);

    if (selectedLearnerIds.length === 0) {
      this.snackBar.open('Please select at least one employee.', 'Close', { duration: 3000 });
      this.isSubmitting = false;
      return;
    }

    this.enrollmentService.enrollUsersInCourse({ courseId: this.data.courseId, learnerIds: selectedLearnerIds })
      .subscribe({
        next: () => {
          this.snackBar.open('Enrollment successful!', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.snackBar.open('Enrollment failed. Please try again.', 'Close', { duration: 3000 });
          console.error(err);
          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
