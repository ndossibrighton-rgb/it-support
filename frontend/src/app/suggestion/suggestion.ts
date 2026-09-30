import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suggestion',
  imports: [FormsModule],
  templateUrl: './suggestion.html',
  styleUrl: './suggestion.css'
})
export class Suggestion implements OnInit {

  form = {
    fullName: '',
    contact: '',
    profession: '',
    suggestion: ''
  };

  ngOnInit() {

    const savedUser = localStorage.getItem('googleUser');

    if (savedUser) {

      const user = JSON.parse(savedUser);

      this.form.fullName = user.name;

      this.loadProfile(user.email);
    }
  }

  async loadProfile(gmail: string) {

    try {

      const response = await fetch(
        `https://it-support-backend-2fqt.onrender.com/profiles/${encodeURIComponent(gmail)}`
      );

      if (response.ok) {

        const profile = await response.json();

        this.form.fullName = profile.full_name;
        this.form.contact = profile.contact;
        this.form.profession = profile.profession;
      }

    } catch (error) {

      console.error(error);
    }
  }

  async submitSuggestion() {

    try {

      const response = await fetch(
        'https://it-support-backend-2fqt.onrender.com/suggestions',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify(this.form)
        }
      );

      const result = await response.json();

      if (response.ok) {

        alert('Suggestion submitted successfully!');

        this.form.suggestion = '';

      } else {

        alert(result.message || 'Failed to submit suggestion.');
      }

    } catch (error) {

      console.error(error);

      alert('Could not connect to the backend.');
    }
  }
}