-- ==========================================
-- StarzLink Seed Data
-- ==========================================

-- Seed Jobs (10 records)
INSERT INTO jobs (title, company, category, location, job_type, salary, deadline, description, responsibilities, requirements, application_link, contact_email, status) VALUES
('Software Engineer', 'Microsoft', 'IT & Software', 'Redmond, WA, USA', 'full-time', '$120,000 - $160,000/year', '2025-12-31', 'Join Microsoft as a Software Engineer and work on cutting-edge cloud technologies. Design, build, and maintain scalable software solutions used by millions worldwide.', 'Design and implement scalable software systems
Collaborate with cross-functional teams
Participate in code reviews
Mentor junior engineers', 'Bachelors degree in Computer Science
3+ years software development experience
Proficiency in Python, Java, or C#
Experience with Azure or AWS', 'https://careers.microsoft.com', 'careers@microsoft.com', 'active'),

('Project Manager', 'UNDP', 'Administration', 'New York, USA', 'full-time', '$80,000 - $95,000/year', '2025-11-30', 'The United Nations Development Programme seeks a Project Manager to lead development initiatives across multiple countries in Africa and Asia.', 'Lead project planning and execution
Manage stakeholder relationships
Monitor project budgets and timelines
Prepare progress reports for donors', 'Masters degree in Project Management
PMP certification preferred
5+ years international development experience
Strong communication skills', 'https://jobs.undp.org', 'hr@undp.org', 'active'),

('Data Analyst', 'Google', 'IT & Software', 'Mountain View, CA, USA', 'full-time', '$95,000 - $130,000/year', '2025-12-15', 'Google is looking for a talented Data Analyst to join the Analytics team. Help make data-driven decisions that impact billions of users worldwide.', 'Analyze large datasets using SQL and Python
Create dashboards and visualizations
Collaborate with product teams
Present insights to leadership', 'Bachelors in Statistics or Mathematics
2+ years data analysis experience
Proficiency in SQL, Python, and Tableau
Strong analytical mindset', 'https://careers.google.com', 'careers@google.com', 'active'),

('Marketing Manager', 'Unilever Nigeria', 'Marketing', 'Lagos, Nigeria', 'full-time', 'N8M - N12M/year', '2025-11-15', 'Unilever Nigeria seeks an experienced Marketing Manager to drive brand growth and consumer engagement across their product portfolio.', 'Develop and execute marketing strategies
Manage marketing budgets
Lead a team of 5 marketers
Analyze consumer market trends', 'Bachelors in Marketing or Business
4+ years FMCG marketing experience
Strong digital marketing skills
Brand management experience', 'https://unilever.com/careers', 'hr.nigeria@unilever.com', 'active'),

('Graphic Designer', 'Deloitte Ghana', 'Design', 'Accra, Ghana', 'full-time', 'GHC 60,000 - 80,000/year', '2025-10-31', 'Deloitte Ghana is looking for a creative Graphic Designer to produce compelling visual content for client communications and marketing materials.', 'Create visual content for marketing
Design presentations and reports
Maintain brand consistency
Collaborate with marketing team', 'Degree in Graphic Design or Fine Arts
2+ years professional experience
Proficiency in Adobe Creative Suite
Strong portfolio required', 'https://deloitte.com/gh/careers', 'careers.ghana@deloitte.com', 'active'),

('Finance Officer', 'World Bank Group', 'Finance', 'Washington D.C., USA', 'full-time', '$75,000 - $90,000/year', '2025-12-01', 'The World Bank Group seeks a Finance Officer to support financial management of international development projects across emerging markets.', 'Monitor project financial performance
Prepare financial statements
Ensure compliance with policies
Train project staff on finance systems', 'CPA or equivalent certification
4+ years financial management experience
Knowledge of international accounting standards
Development organization experience preferred', 'https://worldbank.org/careers', 'jobs@worldbank.org', 'active'),

('Nurse Practitioner', 'Aga Khan Hospital', 'Healthcare', 'Nairobi, Kenya', 'full-time', 'KES 150K - 200K/month', '2025-11-20', 'Aga Khan University Hospital seeks experienced Nurse Practitioners to provide quality patient-centered care in our Level 5 facility.', 'Provide primary and specialty care
Conduct comprehensive patient assessments
Develop and implement care plans
Collaborate with physicians and specialists', 'BSc Nursing
3+ years clinical experience
KNNC registration required
Advanced Life Support certification', 'https://aku.edu/careers', 'hr@aku.edu', 'active'),

('Education Coordinator', 'UNICEF Nigeria', 'Education', 'Abuja, Nigeria', 'contract', '$50,000 - $65,000/year', '2025-10-25', 'UNICEF Nigeria seeks an Education Coordinator to support the implementation of education programs targeting out-of-school children.', 'Coordinate education programs
Conduct field monitoring visits
Prepare detailed program reports
Liaise with government partners', 'Masters in Education or related field
3+ years education program experience
INGO experience required
Knowledge of Nigerian education system', 'https://unicef.org/careers', 'nigen@unicef.org', 'active'),

('Software Developer Intern', 'Andela', 'IT & Software', 'Lagos, Nigeria', 'internship', 'Monthly Stipend + Benefits', '2025-10-15', 'Andela is seeking motivated Software Developer Interns to join our renowned talent accelerator program and build world-class skills.', 'Work on real client software projects
Learn from senior Andela engineers
Participate in agile ceremonies
Contribute to open source projects', 'Enrolled in Computer Science degree
Basic programming knowledge (Python/JavaScript)
Strong problem-solving skills
Self-motivated and eager to learn', 'https://andela.com/careers', 'talent@andela.com', 'active'),

('Social Media Manager', 'Jumia Egypt', 'Marketing', 'Cairo, Egypt', 'full-time', 'EGP 15,000 - 20,000/month', '2025-11-10', 'Jumia Egypt is looking for a creative Social Media Manager to grow our online presence and engage millions of customers across all platforms.', 'Create and schedule social media content
Grow follower base and engagement
Track analytics and report results
Manage paid social campaigns', 'Degree in Marketing or Communications
2+ years social media management
Experience with scheduling tools
Creative content creation skills', 'https://jumia.com.eg/careers', 'hr@jumia.com.eg', 'active');


-- Seed Scholarships (10 records)
INSERT INTO scholarships (title, provider, country, study_level, funding_type, deadline, description, benefits, eligibility, required_documents, application_link, status) VALUES
('Commonwealth Masters Scholarship 2025', 'UK Commonwealth Scholarship Commission', 'United Kingdom', 'Masters', 'fully-funded', '2025-12-15', 'The Commonwealth Masters Scholarships are for candidates from low and middle income Commonwealth countries to pursue Masters study at a UK university.', 'Full tuition fees
Monthly stipend of £1,100
Airfare (economy class)
Arrival allowance
Thesis grant', 'Citizen of a Commonwealth country
First degree with upper-second class honors
Under 40 years of age
Unable to afford UK study without funding', 'CV/Resume
Two reference letters
Research proposal
Academic transcripts
Passport copy', 'https://cscuk.fcdo.gov.uk/apply', 'active'),

('Chevening Scholarship 2025-2026', 'UK Foreign Commonwealth and Development Office', 'United Kingdom', 'Masters', 'fully-funded', '2025-11-05', 'Chevening is the UK governments flagship international awards programme, supporting emerging leaders to study a one-year Masters degree in the UK.', 'Full tuition fees covered
Monthly living allowance
Return economy class flights
Travel grant
Thesis and study materials grant', 'At least 2 years work experience
Citizen of Chevening-eligible country
Hold an undergraduate degree
Return to home country after study', 'Two references
Work experience documentation
University offer letter
Personal statement', 'https://chevening.org/apply', 'active'),

('DAAD German Academic Exchange Scholarship', 'German Academic Exchange Service (DAAD)', 'Germany', 'Masters', 'fully-funded', '2025-10-31', 'DAAD offers scholarships to outstanding foreign students and researchers to pursue graduate studies or research at German higher education institutions.', 'Monthly allowance EUR 934
Health insurance
Travel subsidy
Study and research allowance', 'Bachelors degree with excellent grades
Language proficiency (German/English)
Under 32 years old for most programs
Strong academic references', 'Application form
Motivation letter
CV/Resume
Transcripts and certificates
Language certificate', 'https://daad.de/en/study-and-research-in-germany/scholarships', 'active'),

('Mastercard Foundation Scholars Program', 'Mastercard Foundation', 'Various Countries', 'Undergraduate', 'fully-funded', '2025-09-30', 'The Mastercard Foundation Scholars Program enables academically talented young Africans from disadvantaged backgrounds to access quality secondary and post-secondary education.', 'Full tuition and fees
Room and board
Books and supplies
Transportation allowance
Leadership development', 'African nationality
Demonstrated academic excellence
Financial need
Leadership potential
Commitment to giving back', 'Academic transcripts
Personal essay
Reference letters
Financial need documentation
Leadership experience proof', 'https://mastercardfdn.org/scholars', 'active'),

('Future Leaders Exchange Program (FLEX)', 'US Department of State', 'United States', 'Undergraduate', 'fully-funded', '2025-11-20', 'FLEX provides scholarships for high school students from Eurasia and selected countries to spend one academic year in the United States with American host families.', 'Full program costs covered
Host family accommodation
US high school enrollment
Health insurance
Monthly stipend', 'Secondary school student
Age 15-17 years
High academic achievement
Demonstrated leadership
English language proficiency', 'Academic records
English proficiency test scores
Personal statement
Teacher recommendations
Medical forms', 'https://future-leaders-exchange.org', 'active'),

('Fulbright Foreign Student Program', 'US Department of State', 'United States', 'Masters', 'fully-funded', '2025-10-15', 'The Fulbright Program offers grants to foreign nationals for graduate study, advanced research, or teaching English in the United States.', 'Tuition and fees
Living stipend
Health insurance
Round-trip travel
Cultural enrichment activities', 'Non-US citizen
Strong academic record
Demonstrated leadership
English proficiency
Commitment to exchange purpose', 'Research proposal
CV/Resume
Three recommendation letters
Official transcripts
English test scores', 'https://foreign.fulbrightonline.org', 'active'),

('Chinese Government Scholarship', 'Chinese Scholarship Council (CSC)', 'China', 'Undergraduate', 'fully-funded', '2025-03-31', 'The Chinese Government Scholarship Program supports international students to study at Chinese universities for undergraduate, masters, doctoral, and general scholar programs.', 'Full tuition waiver
Free accommodation
Monthly living allowance CNY 2,500
Medical insurance', 'High school or university graduate
Under 25 (undergraduate) or 35 (masters)
Physical health requirements
Excellent academic record', 'Completed application form
Academic transcripts
Physical examination record
Financial support letter
Passport copy', 'https://csc.edu.cn', 'active'),

('Erasmus Mundus Joint Masters Degree', 'European Commission', 'Various EU Countries', 'Masters', 'fully-funded', '2026-01-15', 'Erasmus Mundus Joint Master Degrees are integrated study programs offered by international consortia of higher education institutions involving at least three countries.', 'Tuition fee waiver
Monthly allowance EUR 1,400
Travel and installation costs
Full health insurance', 'Bachelors degree holder
Non-EU applicants preferred for full scholarships
Strong academic performance
Language requirements vary by program', 'Motivation letter
CV/Resume
Bachelors degree certificate
Language certificates
Two reference letters', 'https://erasmus-plus.ec.europa.eu', 'active'),

('African Development Bank Scholarship', 'African Development Bank (AfDB)', 'Various African Countries', 'Masters', 'fully-funded', '2025-12-01', 'The AfDB Scholarship Program supports exceptional young African students to pursue Masters degree programs in priority development fields at reputable institutions.', 'Full tuition and fees
Monthly living stipend
Round-trip airfare
Health insurance
Books and materials allowance', 'African citizen
Bachelors degree with distinction
Under 35 years of age
Commitment to African development
Strong academic references', 'Completed application form
Official transcripts
Two reference letters
Statement of purpose
Passport and national ID', 'https://afdb.org/scholarships', 'active'),

('Gates Cambridge Scholarship', 'Bill and Melinda Gates Foundation', 'United Kingdom', 'PhD', 'fully-funded', '2025-12-02', 'Gates Cambridge Scholarships are awarded to outstanding applicants from countries outside the UK to pursue a postgraduate degree at the University of Cambridge.', 'Full university fees
Maintenance allowance GBP 20,265/year
Return airfare
Visa costs
Fieldwork and conference grants', 'Non-UK citizen
Applied for full-time postgraduate study at Cambridge
Strong academic achievement
Leadership and commitment to improving lives', 'Research proposal
CV and academic transcripts
References from three academics
Admissions application
Personal statement', 'https://gatescambridge.org/apply', 'active');


-- Seed Trainings (10 records)
INSERT INTO trainings (title, provider, duration, fee, mode, location, start_date, description, what_you_will_learn, certificate_status, instructor, registration_link, status) VALUES
('Python for Data Analysis', 'Coursera / IBM', '8 Weeks', 'Free (Audit) / $49 Certificate', 'online', 'Online', '2025-09-01', 'Learn Python programming for data analysis with real-world projects. This course covers everything from Python basics to advanced data manipulation and visualization.', 'Python fundamentals and syntax
Data manipulation with Pandas
Data visualization with Matplotlib
Statistical analysis techniques
Real-world data projects', 'IBM Professional Certificate', 'Dr. Sarah Chen, IBM Data Scientist', 'https://coursera.org/python-data-analysis', 'active'),

('AWS Certified Solutions Architect', 'Amazon Web Services', '12 Weeks', '$450 / Free prep materials', 'online', 'Online', '2025-10-01', 'Comprehensive preparation for the AWS Solutions Architect Associate exam. Learn to design and deploy scalable, highly available systems on AWS.', 'AWS core services (EC2, S3, RDS)
VPC and network design
High availability architecture
Security best practices
Cost optimization strategies', 'AWS Solutions Architect Associate', 'Michael Torres, AWS Principal Engineer', 'https://aws.amazon.com/training', 'active'),

('UI/UX Design Fundamentals', 'Interaction Design Foundation', '6 Weeks', '$13/month membership', 'online', 'Online', '2025-09-15', 'Master the principles of user interface and user experience design. Create beautiful, functional designs that solve real user problems.', 'User research and personas
Wireframing and prototyping
Design principles and typography
Figma mastery
Usability testing methods', 'Interaction Design Foundation Certificate', 'Lisa Park, Senior UX Designer at Airbnb', 'https://interaction-design.org/courses', 'active'),

('Digital Marketing Essentials', 'HubSpot Academy', '3 Weeks', 'Free', 'online', 'Online', '2025-09-10', 'Master the fundamentals of digital marketing including SEO, social media, content marketing, and email campaigns. Perfect for beginners and intermediate marketers.', 'SEO and keyword strategy
Social media marketing
Email marketing campaigns
Content strategy and creation
Marketing analytics and ROI', 'HubSpot Digital Marketing Certificate', 'Maria Rodriguez, HubSpot Marketing Director', 'https://academy.hubspot.com', 'active'),

('Advanced Microsoft Excel', 'Udemy / Microsoft', '4 Weeks', '$29.99', 'online', 'Online', '2025-10-05', 'Take your Excel skills from basic to expert level. Learn advanced formulas, pivot tables, VBA macros, and data analysis tools used by professionals.', 'Advanced formulas and functions
Pivot tables and charts
VBA macro development
Power Query and Power Pivot
Dashboard creation', 'Microsoft Office Specialist Certificate', 'John Smith, Microsoft MVP', 'https://udemy.com/excel-advanced', 'active'),

('Project Management Professional (PMP)', 'PMI / Simplilearn', '16 Weeks', '$699', 'hybrid', 'Lagos, Nigeria / Online', '2025-11-01', 'Prepare for the globally recognized PMP certification exam. This comprehensive program covers all aspects of project management as per the PMBOK Guide.', 'Project initiation and planning
Scope, schedule, and cost management
Risk and quality management
Agile and hybrid methodologies
Stakeholder management', 'PMI PMP Certification Preparation', 'Dr. James Okafor, PMP, Program Director', 'https://simplilearn.com/pmp', 'active'),

('Cybersecurity Fundamentals', 'Cisco Networking Academy', '10 Weeks', 'Free', 'online', 'Online', '2025-09-20', 'Learn the fundamentals of cybersecurity including threat landscape, network security, ethical hacking basics, and incident response.', 'Network security principles
Threat detection and response
Firewall and VPN configuration
Ethical hacking fundamentals
Security policy development', 'Cisco CyberOps Associate Certificate', 'Ahmed Hassan, Cybersecurity Expert', 'https://netacad.com/cybersecurity', 'active'),

('Entrepreneurship and Business Development', 'Lagos Business School', '8 Weeks', 'N150,000', 'physical', 'Lagos, Nigeria', '2025-10-15', 'A practical program for aspiring entrepreneurs and business owners to develop skills in business planning, financial management, and market strategy.', 'Business plan development
Financial management basics
Market research and strategy
Sales and negotiation skills
Leadership and team building', 'LBS Certificate in Entrepreneurship', 'Prof. Akin Olawale, LBS Faculty', 'https://lbs.edu.ng/executive-education', 'active'),

('Graphic Design Masterclass', 'Adobe / Canva Pro', '5 Weeks', '$89', 'online', 'Online', '2025-09-25', 'Become a professional graphic designer from scratch. Master Adobe Photoshop, Illustrator, and InDesign alongside modern digital design principles.', 'Adobe Photoshop mastery
Vector design with Illustrator
Layout design with InDesign
Brand identity development
Portfolio creation', 'Adobe Certified Professional', 'Emma Johnson, Creative Director', 'https://adobe.com/education', 'active'),

('Data Science Bootcamp', 'Flatiron School', '15 Weeks', '$15,000 (Financing Available)', 'hybrid', 'Nairobi, Kenya / Online', '2025-11-10', 'Intensive data science bootcamp that takes you from beginner to job-ready data scientist. Includes career services and job placement support.', 'Python and R programming
Machine learning algorithms
Deep learning and neural networks
Data engineering fundamentals
Business intelligence and reporting', 'Flatiron School Data Science Certificate', 'Dr. Amara Diallo, Lead Instructor', 'https://flatironschool.com/data-science', 'active');


-- Seed Campus Updates (10 records)
INSERT INTO campus_updates (title, institution, category, date, description, status) VALUES
('Annual Career Fair 2025 Announced', 'University of Lagos', 'events', '2025-05-24', 'The University of Lagos announces its Annual Career Fair 2025. Connect with top employers and explore career opportunities. The fair will feature over 150 companies across various industries. All final year students and recent graduates are encouraged to attend. Registration is free and open to all university students.', 'active'),

('Second Semester Resumption Notice', 'Covenant University', 'announcements', '2025-05-20', 'All returning students are hereby informed that second semester will commence on Monday, May 26, 2025. Students are required to complete online registration before the resumption date. Late registration will attract a fine. Hostel allocation will be available on the student portal from May 22, 2025.', 'active'),

('StarzLink Excellence Scholarship Open', 'Babcock University', 'scholarships', '2025-05-19', 'Applications are open for the StarzLink Excellence Scholarship 2025. The scholarship offers 100% tuition support to outstanding students. Eligible students must have a minimum CGPA of 3.8, demonstrate financial need, and show leadership potential. Apply through the StarzLink platform before the deadline.', 'active'),

('2024/2025 First Semester Results Released', 'University of Ibadan', 'exams', '2025-05-18', 'The 2024/2025 first semester examination results have been officially released. Students can access their results through the university student portal. Any discrepancies in results should be reported to the Examinations and Records Office within two weeks of publication. Grade appeal forms are available at the faculty office.', 'active'),

('Freshers Welcome Week Kicks Off', 'Ahmadu Bello University', 'news', '2025-05-17', 'Ahmadu Bello University kicks off its annual Freshers Welcome Week with a series of exciting events for new students. Activities include campus tours, departmental introductions, cultural nights, sports competitions, and alumni mentorship sessions. New students are encouraged to participate fully in all welcome activities.', 'active'),

('Engineering Department Research Seminar', 'University of Ghana', 'events', '2025-06-10', 'The Department of Engineering, University of Ghana invites students and faculty to an interdisciplinary research seminar on sustainable engineering solutions for Africa. Distinguished professors from MIT, Imperial College, and African universities will present their latest research findings. Registration is mandatory for certificate of participation.', 'active'),

('JAMB 2025 Supplementary Registration Open', 'JAMB/All Nigerian Universities', 'announcements', '2025-05-15', 'The Joint Admissions and Matriculation Board (JAMB) announces the opening of supplementary registration for candidates who did not participate in the main 2025 UTME. Eligible candidates should proceed to any accredited CBT centre with their credentials. The supplementary examination will hold on specific dates as announced.', 'active'),

('Law School Bar Finals Results Published', 'Nigerian Law School', 'exams', '2025-05-12', 'The Nigerian Law School has published the results of the 2025 Bar Finals Examination. Successful candidates are expected to present themselves for the swearing-in ceremony at the Supreme Court of Nigeria. Details of the ceremony including dates, dress code, and required documents will be communicated separately to all successful candidates.', 'active'),

('International Students Conference 2025', 'University of Nairobi', 'events', '2025-06-20', 'The University of Nairobi invites applications for the International Students Leadership Conference 2025. The 5-day conference will bring together student leaders from 50 African universities to discuss solutions to continental challenges. Fully sponsored positions are available for exceptional student leaders. Apply before May 31, 2025.', 'active'),

('Student Union Government Election Results', 'Obafemi Awolowo University', 'news', '2025-05-10', 'The Independent Electoral Commission of Obafemi Awolowo University announces the results of the 2025/2026 Student Union Government elections. The newly elected executives will be inaugurated on Saturday, May 18, 2025. All students are invited to the inauguration ceremony at the university amphitheater.', 'active');


-- Seed Resources (10 records)
INSERT INTO resources (title, category, description, status) VALUES
('Ultimate CV Writing Guide 2025', 'Guides & eBooks', 'A comprehensive guide to writing a professional CV that gets noticed by recruiters and hiring managers. Includes templates, examples, and tips for different industries and career levels.', 'active'),
('Professional CV Template Pack', 'CV Templates', 'A collection of 10 professionally designed CV templates in Word and PDF format. Suitable for graduates, professionals, academics, and creative roles. ATS-friendly designs included.', 'active'),
('Cover Letter Masterclass Guide', 'Guides & eBooks', 'Learn how to write compelling cover letters that complement your CV and tell your unique story. Includes 15 cover letter templates and examples for various job types.', 'active'),
('Interview Preparation Complete Guide', 'Interview Tips', 'Comprehensive interview preparation guide covering common interview questions, STAR method, salary negotiation, virtual interview tips, and post-interview follow-up strategies.', 'active'),
('Scholarship Application Guide 2025', 'Scholarship Guides', 'Step-by-step guide to applying for scholarships successfully. Covers finding scholarships, writing winning essays, getting strong recommendations, and avoiding common mistakes.', 'active'),
('Study Abroad Complete Handbook', 'Study Abroad', 'Everything you need to know about studying abroad, from choosing a country and university, to visa applications, funding your education, and settling in a new country.', 'active'),
('Career Planning Toolkit', 'Career Tools', 'A practical toolkit for planning your career journey. Includes career assessment exercises, goal-setting frameworks, networking strategies, and career pivot guides.', 'active'),
('LinkedIn Profile Optimization Guide', 'Career Tools', 'Maximize your LinkedIn presence with this comprehensive guide. Learn how to optimize your profile for recruiters, build your network, and use LinkedIn for job searching.', 'active'),
('Internship to Full-Time Job Guide', 'Career Tools', 'How to convert your internship into a full-time job offer. Practical strategies for standing out, building relationships, demonstrating value, and negotiating your first salary.', 'active'),
('Personal Statement Writing Templates', 'CV Templates', 'Professional personal statement templates and writing guide for university applications, scholarship applications, and job applications. Includes before and after examples.', 'active');
