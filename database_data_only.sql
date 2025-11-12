--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, password, full_name, is_admin, created_at) FROM stdin;
1	ddomovic@nygenome.org	ddomovic	b7a30eb4707ede49ae4a60c270d356f0857c253e792bfe52802fad3993ced0064d55d42458e89e492f6c6bc67f462b7ded6c30f6aa87aefe5fc5b5e96aff3d2d.c5b39104bebc9efd553db4b34dff3a60	Daniel Domovic	f	2025-05-07 23:33:18.576942
2	daniel.domovic@gmail.com	ddomovic87	3b3ae5bb715b5ee2fec1da14f156ad1961b173991ca0c0bc87b90fd8fcf34089f995c539f1cadb512d89c29d948c1ed5dfddacee804437dc8ba6ec824512fb23.2385f993b6a2fbdd15614a2affff8951	Daniel Domovic	f	2025-05-07 23:43:35.105451
3	mrvica87@gmail.com	mrvica87	e248d0239b6b94b37797e6510b733e079b667c85a9f72c33e00a81014e7ce7143c8214aa0e6ceb3103de230d27dcdedf5b34f3554f30a927800886adb8d3344e.1759301f43688185cc47396c0e468350	Ime Prezime	f	2025-05-09 03:39:05.056369
4	nova.adresa@live.com	test	b1eafdc787c8368066135e3a242d6b161a60c6c2b39159f6e20b48e7a4e25b5be6febf27f1c7d58d88d28b7c7be317d52b4a1d2bff8e8256fc68aafd407794cb.1cabaef431611f305fadb081cc4255f4	Test Test	f	2025-05-09 03:54:38.910563
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, description, domain, created_by_id, created_at) FROM stdin;
\.


--
-- Data for Name: organization_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_analytics (id, organization_id, fiery_red_avg, sunshine_yellow_avg, earth_green_avg, cool_blue_avg, dominant_org_color, org_personality_distribution, teams_summary, updated_at) FROM stdin;
\.


--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_members (id, organization_id, user_id, is_admin, joined_at) FROM stdin;
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_questions (id, text, options) FROM stdin;
1	At my best, I am:	[{"text": "Is determined and decisive", "color": "fiery-red"}, {"text": "Is sociable and dynamic", "color": "sunshine-yellow"}, {"text": "Is caring and patient", "color": "earth-green"}, {"text": "Is precise and questioning", "color": "cool-blue"}]
2	When facing challenges, I prefer to:	[{"text": "Act quickly and directly", "color": "fiery-red"}, {"text": "Involve others and be enthusiastic", "color": "sunshine-yellow"}, {"text": "Support the team and maintain harmony", "color": "earth-green"}, {"text": "Analyze all options methodically", "color": "cool-blue"}]
3	My communication style can be described as:	[{"text": "Brief and to the point", "color": "fiery-red"}, {"text": "Expressive and persuasive", "color": "sunshine-yellow"}, {"text": "Thoughtful and considerate", "color": "earth-green"}, {"text": "Detailed and thorough", "color": "cool-blue"}]
4	I make decisions by:	[{"text": "Taking immediate action", "color": "fiery-red"}, {"text": "Considering how others feel", "color": "sunshine-yellow"}, {"text": "Building consensus in the group", "color": "earth-green"}, {"text": "Analyzing all available data", "color": "cool-blue"}]
5	Under pressure, I may become:	[{"text": "Aggressive or controlling", "color": "fiery-red"}, {"text": "Disorganized or impulsive", "color": "sunshine-yellow"}, {"text": "Indecisive or withdrawn", "color": "earth-green"}, {"text": "Critical or aloof", "color": "cool-blue"}]
6	I find it most motivating when:	[{"text": "I can take charge of situations", "color": "fiery-red"}, {"text": "I can interact with many people", "color": "sunshine-yellow"}, {"text": "I can create a harmonious environment", "color": "earth-green"}, {"text": "I can solve complex problems", "color": "cool-blue"}]
7	In meetings, I tend to:	[{"text": "Focus on results and next steps", "color": "fiery-red"}, {"text": "Generate ideas and share stories", "color": "sunshine-yellow"}, {"text": "Ensure everyone is heard and comfortable", "color": "earth-green"}, {"text": "Ask questions and analyze options", "color": "cool-blue"}]
8	I prefer working with people who are:	[{"text": "Decisive and direct", "color": "fiery-red"}, {"text": "Enthusiastic and creative", "color": "sunshine-yellow"}, {"text": "Supportive and cooperative", "color": "earth-green"}, {"text": "Accurate and logical", "color": "cool-blue"}]
9	I find it challenging to work with people who are:	[{"text": "Slow to decide or overly cautious", "color": "fiery-red"}, {"text": "Serious and lacking enthusiasm", "color": "sunshine-yellow"}, {"text": "Aggressive or insensitive to others", "color": "earth-green"}, {"text": "Disorganized or too impulsive", "color": "cool-blue"}]
10	In social settings, I tend to:	[{"text": "Take the lead and be direct", "color": "fiery-red"}, {"text": "Be lively and the center of attention", "color": "sunshine-yellow"}, {"text": "Listen and focus on individual connections", "color": "earth-green"}, {"text": "Observe and engage in meaningful conversations", "color": "cool-blue"}]
11	When explaining a concept, I typically:	[{"text": "Get straight to the point", "color": "fiery-red"}, {"text": "Use stories and analogies", "color": "sunshine-yellow"}, {"text": "Focus on how it affects people", "color": "earth-green"}, {"text": "Provide comprehensive details", "color": "cool-blue"}]
12	My workspace is usually:	[{"text": "Functional and organized for efficiency", "color": "fiery-red"}, {"text": "Vibrant and stimulating", "color": "sunshine-yellow"}, {"text": "Comfortable and personalized", "color": "earth-green"}, {"text": "Neat and systematically arranged", "color": "cool-blue"}]
13	When working on a team project, I focus on:	[{"text": "Achieving results quickly", "color": "fiery-red"}, {"text": "Making the process fun and engaging", "color": "sunshine-yellow"}, {"text": "Ensuring everyone works well together", "color": "earth-green"}, {"text": "Maintaining high standards and accuracy", "color": "cool-blue"}]
14	I'm most productive when:	[{"text": "I have autonomy and control", "color": "fiery-red"}, {"text": "I'm in a stimulating environment", "color": "sunshine-yellow"}, {"text": "I feel supported by my team", "color": "earth-green"}, {"text": "I have clear guidelines and quiet time", "color": "cool-blue"}]
15	My approach to change is typically:	[{"text": "Embrace it and move forward quickly", "color": "fiery-red"}, {"text": "Get excited about new possibilities", "color": "sunshine-yellow"}, {"text": "Consider how it affects everyone involved", "color": "earth-green"}, {"text": "Analyze the risks and benefits thoroughly", "color": "cool-blue"}]
16	My leadership style tends to be:	[{"text": "Direct and results-oriented", "color": "fiery-red"}, {"text": "Inspirational and encouraging", "color": "sunshine-yellow"}, {"text": "Supportive and collaborative", "color": "earth-green"}, {"text": "Systematic and thorough", "color": "cool-blue"}]
17	In conflict situations, I typically:	[{"text": "Confront issues directly", "color": "fiery-red"}, {"text": "Try to lighten the mood", "color": "sunshine-yellow"}, {"text": "Seek harmony and compromise", "color": "earth-green"}, {"text": "Analyze the facts objectively", "color": "cool-blue"}]
18	When learning something new, I prefer:	[{"text": "Practical, hands-on experience", "color": "fiery-red"}, {"text": "Interactive, group activities", "color": "sunshine-yellow"}, {"text": "Personal guidance and mentoring", "color": "earth-green"}, {"text": "Detailed instructions and research", "color": "cool-blue"}]
19	Others may see me as:	[{"text": "Confident and strong-willed", "color": "fiery-red"}, {"text": "Outgoing and enthusiastic", "color": "sunshine-yellow"}, {"text": "Patient and accommodating", "color": "earth-green"}, {"text": "Analytical and precise", "color": "cool-blue"}]
20	When giving feedback, I tend to be:	[{"text": "Direct and to the point", "color": "fiery-red"}, {"text": "Positive and encouraging", "color": "sunshine-yellow"}, {"text": "Gentle and supportive", "color": "earth-green"}, {"text": "Detailed and constructive", "color": "cool-blue"}]
21	I value most in a workplace:	[{"text": "Efficiency and results", "color": "fiery-red"}, {"text": "Creativity and enthusiasm", "color": "sunshine-yellow"}, {"text": "Harmony and cooperation", "color": "earth-green"}, {"text": "Quality and accuracy", "color": "cool-blue"}]
22	When setting goals, I focus on:	[{"text": "Ambitious targets and quick wins", "color": "fiery-red"}, {"text": "Exciting possibilities and innovation", "color": "sunshine-yellow"}, {"text": "Sustainable progress and team wellbeing", "color": "earth-green"}, {"text": "Detailed plans and measured outcomes", "color": "cool-blue"}]
23	My biggest strength is:	[{"text": "Taking action and driving results", "color": "fiery-red"}, {"text": "Inspiring others and generating enthusiasm", "color": "sunshine-yellow"}, {"text": "Building relationships and supporting others", "color": "earth-green"}, {"text": "Analyzing situations and ensuring accuracy", "color": "cool-blue"}]
24	When making a presentation, I typically:	[{"text": "Focus on key points and bottom line", "color": "fiery-red"}, {"text": "Use engaging stories and visuals", "color": "sunshine-yellow"}, {"text": "Create a comfortable atmosphere", "color": "earth-green"}, {"text": "Provide detailed information and analysis", "color": "cool-blue"}]
25	My ideal weekend would include:	[{"text": "Challenging activities and achievements", "color": "fiery-red"}, {"text": "Social events and spontaneous fun", "color": "sunshine-yellow"}, {"text": "Relaxing with close friends or family", "color": "earth-green"}, {"text": "Pursuing interests and learning new things", "color": "cool-blue"}]
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.teams (id, name, description, created_by_id, organization_id, invite_code, created_at) FROM stdin;
2	Team 2	Description	1	\N	7aaec38fc548	2025-05-08 20:35:57.674615
4	Moj		4	\N	286c6096f3ce	2025-05-09 03:55:19.392873
1	Test	Test m	1	\N	49511ddc18c7	2025-05-08 14:59:36.349076
5	Test	sdlmflsf	1	\N	6bfc4e12ae2b	2025-05-12 20:27:10.018179
\.


--
-- Data for Name: quiz_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_results (id, user_id, team_id, organization_id, title, fiery_red_score, sunshine_yellow_score, earth_green_score, cool_blue_score, dominant_color, secondary_color, personality_type, created_at, is_private, fiery_red_unconscious_score, sunshine_yellow_unconscious_score, earth_green_unconscious_score, cool_blue_unconscious_score, dominant_unconscious_color, secondary_unconscious_color, unconscious_personality_type) FROM stdin;
13	1	\N	\N	Latest Quiz Result	45	29	76	76	earth-green	cool-blue	Coordinator	2025-05-12 04:50:51.43308	f	24	24	55	71	cool-blue	earth-green	Coordinator
\.


--
-- Data for Name: quiz_answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quiz_answers (id, result_id, question_id, selected_color, rating, is_conscious_response) FROM stdin;
497	13	1	fiery-red	L	t
498	13	1	sunshine-yellow	3	t
499	13	1	earth-green	M	t
500	13	1	cool-blue	5	t
501	13	2	fiery-red	L	t
502	13	2	sunshine-yellow	3	t
503	13	2	earth-green	4	t
504	13	2	cool-blue	M	t
505	13	3	fiery-red	4	t
506	13	3	sunshine-yellow	1	t
507	13	3	earth-green	M	t
508	13	3	cool-blue	L	t
509	13	4	fiery-red	L	t
510	13	4	sunshine-yellow	4	t
511	13	4	earth-green	5	t
512	13	4	cool-blue	M	t
513	13	5	fiery-red	L	t
514	13	5	sunshine-yellow	2	t
515	13	5	earth-green	M	t
516	13	5	cool-blue	4	t
517	13	6	fiery-red	M	t
518	13	6	sunshine-yellow	L	t
519	13	6	earth-green	2	t
520	13	6	cool-blue	3	t
521	13	7	fiery-red	M	t
522	13	7	sunshine-yellow	L	t
523	13	7	earth-green	3	t
524	13	7	cool-blue	5	t
525	13	8	fiery-red	5	t
526	13	8	sunshine-yellow	L	t
527	13	8	earth-green	M	t
528	13	8	cool-blue	4	t
529	13	9	fiery-red	4	t
530	13	9	sunshine-yellow	L	t
531	13	9	earth-green	M	t
532	13	9	cool-blue	5	t
533	13	10	fiery-red	1	t
534	13	10	sunshine-yellow	L	t
535	13	10	earth-green	M	t
536	13	10	cool-blue	5	t
537	13	11	fiery-red	5	t
538	13	11	sunshine-yellow	L	t
539	13	11	earth-green	4	t
540	13	11	cool-blue	M	t
541	13	12	fiery-red	M	t
542	13	12	sunshine-yellow	L	t
543	13	12	earth-green	3	t
544	13	12	cool-blue	5	t
545	13	13	fiery-red	4	t
546	13	13	sunshine-yellow	L	t
547	13	13	earth-green	3	t
548	13	13	cool-blue	M	t
549	13	14	fiery-red	5	t
550	13	14	sunshine-yellow	4	t
551	13	14	earth-green	L	t
552	13	14	cool-blue	M	t
553	13	15	fiery-red	L	t
554	13	15	sunshine-yellow	1	t
555	13	15	earth-green	4	t
556	13	15	cool-blue	M	t
557	13	16	fiery-red	4	t
558	13	16	sunshine-yellow	L	t
559	13	16	earth-green	M	t
560	13	16	cool-blue	5	t
561	13	17	fiery-red	3	t
562	13	17	sunshine-yellow	L	t
563	13	17	earth-green	M	t
564	13	17	cool-blue	5	t
565	13	18	fiery-red	5	t
566	13	18	sunshine-yellow	L	t
567	13	18	earth-green	M	t
568	13	18	cool-blue	4	t
569	13	19	fiery-red	2	t
570	13	19	sunshine-yellow	4	t
571	13	19	earth-green	M	t
572	13	19	cool-blue	L	t
573	13	20	fiery-red	L	t
574	13	20	sunshine-yellow	5	t
575	13	20	earth-green	M	t
576	13	20	cool-blue	4	t
577	13	21	fiery-red	5	t
578	13	21	sunshine-yellow	4	t
579	13	21	earth-green	L	t
580	13	21	cool-blue	M	t
581	13	22	fiery-red	L	t
582	13	22	sunshine-yellow	1	t
583	13	22	earth-green	5	t
584	13	22	cool-blue	M	t
585	13	23	fiery-red	2	t
586	13	23	sunshine-yellow	L	t
587	13	23	earth-green	M	t
588	13	23	cool-blue	5	t
589	13	24	fiery-red	L	t
590	13	24	sunshine-yellow	M	t
591	13	24	earth-green	3	t
592	13	24	cool-blue	5	t
593	13	25	fiery-red	L	t
594	13	25	sunshine-yellow	5	t
595	13	25	earth-green	M	t
596	13	25	cool-blue	2	t
\.


--
-- Data for Name: report_comparisons; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.report_comparisons (id, user_id, report_a_id, report_b_id, title, notes, created_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
rfZFO8Rh5C2pRU1uVdr8vFnkmmpp8pcX	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-19T18:04:12.107Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-11-19 18:04:16
dSzlYfjKkbqljuTYWNwkTp5kTt51ZCQ6	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-19T18:04:26.399Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-11-19 18:04:27
7zCqgGWK21BNSWOu2_wsfChuR93g75m7	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-19T18:09:42.075Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":1}}	2025-11-19 18:09:43
\.


--
-- Data for Name: team_analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_analytics (id, team_id, fiery_red_avg, sunshine_yellow_avg, earth_green_avg, cool_blue_avg, dominant_team_color, team_personality_distribution, strengths_analysis, blindspots_analysis, updated_at) FROM stdin;
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, team_id, user_id, is_leader, joined_at) FROM stdin;
1	1	1	t	2025-05-08 14:59:36.405257
2	2	1	t	2025-05-08 20:35:57.717263
4	1	3	f	2025-05-09 03:39:37.497672
6	4	4	t	2025-05-09 03:55:19.434153
7	4	1	f	2025-05-09 03:55:28.179594
8	5	1	t	2025-05-12 20:27:10.060905
\.


--
-- Name: organization_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_analytics_id_seq', 1, false);


--
-- Name: organization_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_members_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 1, false);


--
-- Name: quiz_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_answers_id_seq', 596, true);


--
-- Name: quiz_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_questions_id_seq', 25, true);


--
-- Name: quiz_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.quiz_results_id_seq', 13, true);


--
-- Name: report_comparisons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.report_comparisons_id_seq', 3, true);


--
-- Name: team_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_analytics_id_seq', 1, false);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 8, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.teams_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

