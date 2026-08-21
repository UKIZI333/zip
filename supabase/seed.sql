-- Optional: sample jobs so the site isn't empty on first run.
-- Safe to skip — the admin dashboard can create jobs from scratch.

insert into public.jobs (title, slug, location, department, employment_type, short_description, description, responsibilities, requirements, benefits, status)
values
(
  'IT Support Specialist',
  'it-support-specialist',
  'Prishtina, Kosovo',
  'Information Technology',
  'Full Time',
  'We are looking for an experienced IT Support Specialist to join our growing team.',
  'You will be the first point of contact for internal IT issues, keeping our hardware, software, and network running smoothly across the company.',
  array['Respond to and resolve internal support tickets', 'Set up and maintain employee hardware and accounts', 'Monitor network and system performance', 'Document recurring issues and fixes'],
  array['2+ years in an IT support role', 'Comfortable with Windows, macOS, and basic networking', 'Clear communicator, calm under pressure'],
  array['Private health insurance', 'Hybrid working schedule', 'Annual training budget'],
  'published'
),
(
  'Sales Manager',
  'sales-manager',
  'Prishtina, Kosovo',
  'Sales',
  'Full Time',
  'We are looking for an experienced Sales Manager to lead our regional sales efforts.',
  'You will own the full sales cycle for your territory, build a pipeline, and mentor a small team of account executives.',
  array['Own quarterly sales targets for the region', 'Build and coach a team of account executives', 'Report on pipeline health to leadership'],
  array['4+ years in B2B sales, 1+ in a leadership role', 'Track record of hitting or exceeding targets', 'Fluent in English'],
  array['Uncapped commission structure', 'Company car allowance', 'Private health insurance'],
  'published'
);
