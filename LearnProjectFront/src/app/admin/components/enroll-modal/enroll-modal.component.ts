// karim9155/learner/Learner-fc5557b9b5123c3ec285bf8abc7969b10e56450d/LearnProjectFront/src/app/admin/components/enroll-modal/enroll-modal.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService, User } from '../../../services/user.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-enroll-modal',
  standalone: false,
  templateUrl: './enroll-modal.component.html',
  styleUrls: ['./enroll-modal.component.css']
})
export class EnrollModalComponent implements OnInit {

  isSubmitting = false;
  displayedColumns: string[] = ['select', 'name', 'email', 'department', 'badgeNumber', 'phone'];
  dataSource = new MatTableDataSource<User>();
  selection = new SelectionModel<User>(true, []);

  constructor(
    public dialogRef: MatDialogRef<EnrollModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { courseId: string, courseName: string },
    private userService: UserService,
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.userService.getEmployees(0, 1000, '').subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
      },
      error: (err) => {
        console.error('Failed to load employees for modal', err);
        this.snackBar.open('Could not load the employee list.', 'Close', { duration: 3000 });
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onEnroll(): void {
    this.isSubmitting = true;
    const selectedLearnerIds = this.selection.selected.map(user => user.id);

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
