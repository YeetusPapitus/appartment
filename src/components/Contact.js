// Contact.js

import { useState } from 'react';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name    = 'Name is required';
    if (!form.email.trim())   errs.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
                              errs.email   = 'Invalid email';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch('/appartment/api/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus('Your message has been sent!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus(data.error || 'Submission failed');
      }
    } catch (err) {
      setSubmitStatus('Server error, please try again later');
    }
  };

  return (
    <section className="w-full bg-sky py-12 px-4" id="contact">
      <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-4 space-y-6">
          <h2 className="text-3xl text-charcoal">Contact Us</h2>
          <p className="text-charcoal text-xl">
            Have questions or need assistance? We are here to help you.
          </p>

          <div className="space-y-8 pt-8">
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-royal text-2xl mt-1 pe-1" />
              <p className="text-charcoal text-xl">123 Apartment Street, City Name, Country</p>
            </div>

            <div className="flex items-start gap-3">
              <FaPhoneAlt className="text-royal text-2xl mt-1" />
              <p className="text-charcoal text-xl">+385 01 234 5678</p>
            </div>

            <div className="flex items-start gap-3">
              <FaEnvelope className="text-royal text-2xl mt-1" />
              <p className="text-charcoal text-xl">info@appartment.com</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-4 my-8 bg-stone/50 rounded-lg shadow-lg transform transition-all duration-500 lg:hover:scale-105">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm text-charcoal">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                className="mt-2 w-full border-2 border-royal rounded-lg px-4 py-2 focus:outline-none bg-transparent text-charcoal"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-charcoal">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="mt-2 w-full border-2 border-royal rounded-lg px-4 py-2 focus:outline-none bg-transparent text-charcoal"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-charcoal">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="4"
                className="mt-2 w-full border-2 border-royal rounded-lg px-4 py-2 focus:outline-none bg-transparent resize-none text-charcoal"
              />
              {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-olive text-white py-3 px-6 rounded-lg hover:bg-olive-dark transition"
              >
                Send Message
              </button>
            </div>

            {submitStatus && (
              <p className="text-center text-gray-800 mt-4">{submitStatus}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
