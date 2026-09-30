import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  profile = {
    fullName: '',
    gmail: '',
    contact: '',
    profession: ''
  };

  loading = false;
  message = '';

  ngOnInit() {

    const savedUser = localStorage.getItem('googleUser');

    if (!savedUser) {
      this.message = 'Please login with Google first.';
      return;
    }

    const user: GoogleUser = JSON.parse(savedUser);

    // Get real Google information
    this.profile.fullName = user.name;
    this.profile.gmail = user.email;

    // Load existing profile from PostgreSQL
    this.loadProfile();
  }

  async loadProfile() {

    try {

      const response = await fetch(
        `https://it-support-backend-2fqt.onrender.com/profiles/${encodeURIComponent(this.profile.gmail)}`
      );

      if (response.ok) {

        const data = await response.json();

        this.profile.fullName = data.full_name;
        this.profile.gmail = data.gmail;
        this.profile.contact = data.contact;
        this.profile.profession = data.profession;

        return;
      }

      if (response.status === 404) {
        this.message = 'Complete your profile information.';
      }

    } catch (error) {

      console.error(error);
      this.message = 'Could not connect to the backend.';

    }
  }

  async saveProfile() {

    this.loading = true;
    this.message = '';

    try {

      // Check whether profile already exists
      const checkResponse = await fetch(
        `https://it-support-backend-2fqt.onrender.com/profiles/${encodeURIComponent(this.profile.gmail)}`
      );

      let response;

      if (checkResponse.ok) {

        // UPDATE existing profile
        response = await fetch(
          `https://it-support-backend-2fqt.onrender.com/profiles/${encodeURIComponent(this.profile.gmail)}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fullName: this.profile.fullName,
              contact: this.profile.contact,
              profession: this.profile.profession
            })
          }
        );

      } else {

        // CREATE new profile
        response = await fetch(
          'https://it-support-backend-2fqt.onrender.com/profiles',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fullName: this.profile.fullName,
              gmail: this.profile.gmail,
              contact: this.profile.contact,
              profession: this.profile.profession
            })
          }
        );
      }

      const result = await response.json();

      if (response.ok) {

        this.message = 'Profile saved successfully!';

      } else {

        this.message = result.message || 'Failed to save profile.';

      }

    } catch (error) {

      console.error(error);
      this.message = 'Could not connect to the backend.';

    }

    this.loading = false;
  }
}