'use client';

import React from 'react';

export default function GCUDLPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <section className="max-w-3xl mx-auto space-y-8">
          {/* Header Section */}
          <header className="space-y-4 mb-12">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                Lab Initiative
              </p>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900">
              GCUDL – Garden City Data Engineering Lab
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              GCUDL is a collaborative research and innovation space at Garden City University 
              where students and faculty explore modern data engineering, artificial intelligence, 
              and machine learning practices. The lab fosters hands-on learning and real-world 
              project development in a supportive, community-driven environment.
            </p>
          </header>

          {/* About Section */}
          <section className="space-y-6 py-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">About the Lab</h2>
            <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
              <p>
                The Garden City Data Engineering Lab brings together learners, mentors, 
                and industry partners to design, build, and deploy data-driven solutions that 
                address practical challenges in business, society, and academic research.
              </p>
              <p>
                GCUDL supports both beginners and advanced practitioners through guided projects, 
                access to shared tools and infrastructure, and a vibrant community that values 
                curiosity, ethical data practices, and technical excellence.
              </p>
            </div>
          </section>

          {/* Activities Section */}
          <section className="space-y-6 py-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900">What Happens in the Lab</h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start gap-4">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  <strong>Data Pipelines & Dashboards:</strong> Building scalable, production-ready 
                  data systems using modern tools and best practices.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  <strong>AI & ML Prototypes:</strong> Exploring machine learning and artificial 
                  intelligence with curated, real-world datasets.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  <strong>Collaborative Projects:</strong> Working on interdisciplinary initiatives 
                  with student startups, faculty research, and campus partners.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  <strong>Workshops & Mentorship:</strong> Regular skill-building sessions, 
                  tech talks, and one-on-one guidance from industry professionals.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>
                  <strong>Documentation & Knowledge Sharing:</strong> Creating open resources 
                  and best-practice guides for reproducible, reliable data workflows.
                </span>
              </li>
            </ul>
          </section>

          {/* CTA Section */}
          <section className="py-12 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Join?
              </h3>
              <p className="text-gray-700 mb-6">
                Whether you're just starting your data journey or you're an experienced practitioner, 
                GCUDL welcomes you. Connect with the team to learn more about membership, ongoing projects, 
                and upcoming events.
              </p>
              <a
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Contact Us
              </a>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
