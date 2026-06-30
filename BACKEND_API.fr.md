# Référence de l'API Backend — Map Action (Mapapi)

Ce document décrit le backend Django REST qui alimente ce dashboard. Dépôt source : **https://github.com/223MapAction/Mapapi** (Django + DRF + SimpleJWT + Celery/Redis + Postgres/Supabase). URL de base en production : **`https://api.map-action.com`** (définie dans `src/config/api_url_base.jsx`).

> Portée : tout ce dont le frontend a besoin — endpoints, authentification, schémas de requête/réponse, énumérations et pièges. Produit en étudiant le code source du backend (`Mapapi/urls.py`, `views/`, `serializer.py`, `models.py`, `permissions.py`, `backend/settings.py`).

> ### 🔎 Documentation interactive (Swagger / OpenAPI)
> Le backend expose une documentation interactive **en direct, toujours à jour** — le moyen le plus rapide d'explorer et *tester* les endpoints :
> - **Swagger UI :** `<backend>/MapApi/schema/swagger-ui/` — cliquez sur **Authorize**, collez votre token `access` (obtenu via `POST /MapApi/login/`) et appelez n'importe quel endpoint.
> - **ReDoc :** `<backend>/MapApi/schema/redoc/` · **Schéma brut :** `<backend>/MapApi/api/schema/`
>
> Sur notre déploiement `<backend>` = `https://backend-production-0726b.up.railway.app`. Chaque opération est taguée par domaine (Incidents, Collaboration, Organisations, Auth…) avec les vrais corps de requête/réponse, paramètres et codes d'erreur. Ce fichier Markdown reste le compagnon commenté (justifications, pièges, divergences) ; Swagger est la référence exhaustive générée automatiquement.

> 🇬🇧 Une version anglaise existe : [`BACKEND_API.md`](./BACKEND_API.md). Les deux fichiers doivent rester synchronisés.

> **⚠️ Les IDs sont des UUID (2026).** Chaque clé primaire et étrangère est désormais une **chaîne UUID** (ex. `"3f9a…-…"`), plus un entier — pour empêcher l'énumération des ids (IDOR). Les routes de détail sont `/<uuid>` (ex. `GET /MapApi/incident/<uuid>`). Côté frontend, **ne jamais faire `parseInt()` sur un id** ; comparer les ids en chaîne. Les tables ont aussi migré du schéma `extensions` vers **`public`**. La migration a invalidé les anciennes sessions (le token portait l'ancien id entier) — les utilisateurs se reconnectent une fois.

---

## 1. Conventions (à lire en premier)

- **Préfixe d'URL :** chaque endpoint ci-dessous est sous **`/MapApi/`** (ex. `https://api.map-action.com/MapApi/incident/`). Routage racine : `backend/urls.py` → `path('MapApi/', include('Mapapi.urls'))`.
- **Les slashs de fin sont incohérents et significatifs.** Certaines routes finissent par `/`, d'autres non (ex. `incident/<id>` n'a PAS de slash ; `incident/` en a un). Chaque endpoint indique le chemin exact. Respectez-le à la lettre — Django ne redirige pas automatiquement un POST.
- **En-tête d'authentification :** `Authorization: Bearer <access_token>` (JWT). Voir §2.
- **⚠️ La plupart des endpoints ne sont PAS authentifiés.** Beaucoup d'endpoints de liste/statistiques/référence déclarent `permission_classes = ()` (entièrement publics). Seuls les endpoints récents (collaboration sur incident, membres d'organisation, profil, corbeille/actions groupées) exigent une authentification. La ligne « Auth » de chaque endpoint fait foi. Ne supposez **pas** que le backend protège les données — ce n'est souvent pas le cas.
- **CORS :** `CORS_ALLOW_ALL_ORIGINS = True` — n'importe quelle origine peut appeler l'API.
- **Pagination :** les endpoints de liste utilisant `CustomPageNumberPagination` renvoient `{ "count", "next", "previous", "results": [...] }`. Paramètres de requête : `?page=<n>&page_size=<n>` (défaut `page_size=100`, max `1000`). Quelques anciennes listes utilisent la `PageNumberPagination` par défaut de DRF (taille de page 10, `?page=` seulement). Plusieurs endpoints renvoient un **tableau simple** (sans pagination) — précisé au cas par cas. **Le code frontend gère déjà les deux formes** (`data.results ?? data`) ; continuez ainsi.
- **Types de contenu :** JSON pour la plupart des écritures. Les endpoints qui acceptent des fichiers (`photo`, `video`, `audio`, `attachment`, `proof_image`, `proof_video`, `file`, `logo`) exigent **`multipart/form-data`**.
- **URLs des médias :** les fichiers uploadés sont servis sous `/uploads/...` (`MEDIA_URL`) ; les champs image/vidéo/voix/document peuvent aussi être stockés sur Supabase. Traitez les champs fichier comme des URLs renvoyées par l'API.
- **Forme des erreurs :** non standardisée. Erreurs de validation → dict DRF `{ "field": ["msg"] }` (400). Erreurs personnalisées → `{ "error": "message en français" }` ou `{ "detail": "..." }`. Certains 404 ont un corps vide. Les codes de statut sont parfois non idiomatiques (ex. `GET /image/` renvoie `201`). Ne vous fiez pas au seul statut — inspectez le corps.
- **Langue :** les messages d'erreur/de notification sont en **français**.

---

## 2. Authentification

JWT via `rest_framework_simplejwt`. Configuré dans `backend/settings.py` :

- **Durée de vie du token d'accès : 90 jours.** Token de rafraîchissement : 1 jour. Les tokens ne sont **ni** renouvelés (rotation) **ni** mis sur liste noire. (Ce token d'accès à longue durée de vie explique pourquoi le frontend peut conserver une session longtemps dans `sessionStorage`.)
- `USERNAME_FIELD = 'email'` → **la connexion utilise `email`, pas `username`.**
- La classe d'authentification par défaut est `CookieJWTAuthentication` (**Bearer d'abord**, puis repli sur le cookie httpOnly) ; il n'y a **pas** de `DEFAULT_PERMISSION_CLASSES` global, donc une vue sans `permission_classes` est de fait **publique**.
- **Le dashboard s'authentifie avec `Authorization: Bearer` (token en `sessionStorage`), pas par cookie.** Les cookies httpOnly ont été essayés mais ne peuvent pas fonctionner ici : le frontend et le backend sont sur des sites différents (`*.up.railway.app` est un suffixe public, et le dev local tourne sur `localhost`), donc le cookie d'auth est tiers et le navigateur le bloque. Le `/login/` renvoie `access`/`refresh` dans le corps précisément pour cette raison. Ne pas réintroduire l'auth par cookie seul, sauf si le FE et le BE sont servis en same-site (domaine racine commun) ou derrière un proxy same-origin.

### Flux de connexion principal (utilisé par le dashboard)

| Étape | Endpoint | Renvoie |
|---|---|---|
| 1. Obtenir les tokens | `POST /MapApi/login/` (alias `POST /MapApi/api/token/`) | `{ "access", "refresh" }` |
| 2. Récupérer l'utilisateur courant | `GET /MapApi/user_retrieve/` (Bearer) | `{ "status", "message", "data": <User> }` |
| 3. Rafraîchir | `POST /MapApi/token/refresh/` `{ "refresh" }` | `{ "access" }` |
| 4. Vérifier | `POST /MapApi/verify-token/` `{ "token" }` | `200 {}` ou `401` |

Corps de `POST /MapApi/login/` : `{ "email", "password" }`. En cas de mauvais identifiants → `401`.

`GET /MapApi/user_retrieve/` est l'appel canonique « qui suis-je ». Le champ `data` de la réponse est un objet `UserSerializer` (voir §4) incluant le champ en lecture seule `organisation_name`. (Le frontend lit `response.data.data || response.data`.)

### Autres endpoints liés à l'authentification

| Méthode · Chemin | Auth | Corps → Réponse |
|---|---|---|
| `POST /MapApi/register/` | aucune | `{first_name,last_name,email,password,phone,address}` → `201 { user, token:{refresh,access} }` (connexion automatique à l'inscription). `GET` liste tous les utilisateurs. |
| `POST /MapApi/registerCitizen/` | aucune | `{ email }` → `201`, envoie un lien de vérification par email. |
| `GET /MapApi/verify-email/<uuid:token>/` | aucune | passe `is_verified=true`. |
| `PUT/PATCH /MapApi/set-password/` | Bearer | `{ password }` → définit le mot de passe de l'utilisateur courant (après vérification). |
| `POST /MapApi/gettoken_bymail/` | aucune | `{ email }` → `201 { token }` (token **d'accès** brut, **sans vérification de mot de passe** — émet un token à partir du seul email ; à considérer comme sensible). |
| `GET /MapApi/get_csrf_token/` | aucune | `{ csrf_token }`. |

### Réinitialisation / changement de mot de passe (correspond à `authService.js`)

| Méthode · Chemin | Auth | Corps → Comportement |
|---|---|---|
| `POST /MapApi/password/` | aucune | `{ email }` → envoie par email un `code` alphanumérique de 7 caractères (valide ~1h). `201 {status,message}`. |
| `POST /MapApi/password_reset/` | aucune | `{ email, code, new_password, new_password_confirm }` → réinitialise le mot de passe. Les erreurs renvoient `{status:"failure", message}` avec des messages comme `"non matching passwords"`, `"reset code has expired"`, `"no such item"`. |
| `PUT/PATCH /MapApi/change_password/` | Bearer | `{ old_password, new_password }` → `200 {status,code,message,data}` ; mauvais ancien mot de passe → `400 {"old_password":["Wrong password."]}`. |

> ⚠️ Le `authService.changePassword` du frontend envoie `{ old_password, new_password }` via `POST`. La vue backend `ChangePasswordView` est une `UpdateAPIView` (attend `PUT`/`PATCH`). Vérifiez la méthode — un `POST` peut renvoyer 405.

### Authentification des agents de terrain (mobile/terrain, pas le dashboard web)

Les agents de terrain (`org_role = field_agent`) n'utilisent pas email/mot de passe. Ils se connectent avec un **`agent_code`** généré ou un **téléphone + PIN à 4 chiffres** :

- `POST /MapApi/agent-login/` `{ agent_code }` → `{ access, refresh, user:{...} }`. Erreurs : `401 "Code agent invalide."`, `403 "Ce compte est désactivé."`.
- `POST /MapApi/agent-pin-login/` `{ phone, pin }` → `{ access, refresh, user:{..., must_change_pin } }`. Si `must_change_pin` est vrai, forcer un changement de PIN.
- `POST /MapApi/agent/change-pin/` (Bearer, agents de terrain uniquement) `{ old_pin, new_pin }`. `new_pin` doit faire 4 chiffres et ne pas être trivial (`0000/1234/1111/...`).

### OTP / téléphone (SMS via Orange Mali)

- `POST /MapApi/otpRequest/` `{ phone }` → envoie un OTP à 6 chiffres (expiration 5 min).
- `POST /MapApi/verifyOtp/` `{ phone, otp }` → `{ access, refresh, user }`.
- `GET|POST /MapApi/verify_otp/` — variante TOTP `PhoneOTP` (champ `phone_number`).

---

## 3. Énumérations / constantes

Toutes les valeurs sont les chaînes brutes stockées/renvoyées par l'API (depuis `models.py`).

| Groupe | Champ | Valeurs |
|---|---|---|
| **Statut d'incident** | `Incident.etat` | `declared`, `taken_into_account`, `in_progress`, `resolved` |
| **Mode de prise en charge** | `Incident.take_in_charge_mode` | `internal`, `collaborative`, `null` |
| **Rôle web (CANONIQUE)** | `User.web_role` *(lecture seule, calculé)* | `super_admin`, `org_admin`, `bureau_agent`, `field_agent`, `null` |
| **Type d'utilisateur** | `User.user_type` | `admin`, `visitor`, `reporter`, `citizen`, `business`, `elu`, `field_agent` |
| **Rôle interne (organisation)** | `User.org_role` | `org_admin`, `bureau_agent`, `field_agent`, `null` |

> **Quel champ de rôle utiliser :** toujours lire **`web_role`** pour l'autorisation du dashboard. C'est le rôle canonique unique, calculé côté serveur : `is_superuser ? super_admin : (org_role ou null)` (cf. `Mapapi/roles.py`). Un utilisateur sans rôle vaut `null` — **jamais** super_admin. `org_role` est le champ interne brut (pas de valeur super_admin) ; `user_type` est une classification héritée de l'app citoyenne (`elu`, `citizen`, …) **sans rapport** avec l'accès dashboard — ne pas en déduire le rôle. `web_role` est désormais présent sur toute représentation d'utilisateur (`UserSerializer`, users imbriqués incident/collaboration, et `OrganisationMemberSerializer`).
| **Rôle de collaboration** | `Collaboration.role` | `leader`, `contributor`, `observer` (défaut `contributor` ; `leader` est attribué automatiquement uniquement, jamais demandable) |
| **Statut de collaboration** | `Collaboration.status` | `pending`, `accepted`, `declined` |
| **État de tâche** | `IncidentTask.state` | `pending`, `in_progress`, `done`, `failed` |
| **Statut de suggestion de partenaire** | `PartnerSuggestion.status` | `pending`, `accepted`, `rejected` |
| **Rôle de suggestion de partenaire** | `PartnerSuggestion.suggested_role` | `contributor`, `observer` |
| **Statut d'assignation** | `IncidentAssignment.status` | `pending`, `in_progress`, `reported`, `cancelled` |
| **Statut de prédiction** | `Prediction.status` | `pending`, `processing`, `completed`, `completed_with_warning`, `failed` |
| **Statut de rapport** | `Rapport.statut` | `new`, `in_progress`, `edit`, `canceled` |
| **Rôle de chat** | `ChatHistory.role` | `user`, `assistant`, `system` |
| **Type d'organisation** | `Organisation.organisation_type` | `ngo`=ONG, `international_organisation`=Organisation internationale, `un_agency`=Agence UN, `public_institution`=Institution publique, `local_authority`=Collectivité territoriale, `association_cso`=Association / OSC, `private_sector`=Secteur privé, `project_program`=Projet / Programme, `community_structure`=Structure communautaire, `other`=Autre |
| **Secteur d'activité de l'org.** | `Organisation.activity_sector` | `environment`=Environnement, `sanitation`=Assainissement, `water_wash`=Eau / WASH, `health`=Santé, `food_security`=Sécurité alimentaire, `protection`=Protection, `humanitarian`=Humanitaire, `development`=Développement, `governance`=Gouvernance, `education`=Éducation, `technology_data`=Technologie / Données, `multisector`=Multisectoriel, `other`=Autre |
| **Pays d'intervention** | `Organisation.intervention_country` | `senegal`, `mali`, `guinea`, `burkina_faso`, `niger`, `cote_divoire`, `mauritania` |
| **Statut de partenaire** | `Organisation.partner_status` | `active`, `inactive` |
| **Extensions de pièce jointe (chat)** | `DiscussionMessage.attachment` | `pdf`, `doc`, `docx`, `xls`, `xlsx` uniquement |

---

## 4. Schémas principaux

Les noms de champs sont **exacts**, tels que dans les modèles/sérialiseurs. `auto` = défini par le serveur. Les clés étrangères sont renvoyées comme l'id de l'objet lié, sauf si un sérialiseur imbrique l'objet complet (précisé). Notez les fautes d'orthographe héritées, utilisées telles quelles : **`lattitude`** (incidents/zones), **`adress`**, **`colaboration`**.

### User (`UserSerializer` — renvoyé par `user_retrieve`, imbriqué dans les incidents)
Exclut `password`, `is_superuser`, `is_active`, `is_staff`, `user_permissions`. Champs clés :
`id`, `email`, `first_name`, `last_name`, `phone`, `avatar` (url image, défaut `avatars/default.png`), `address`, `user_type` (énum), `organisation` (chaîne libre héritée), `organisation_member` (id FK → Organisation), **`organisation_name`** (lecture seule, depuis l'org liée), `org_role` (énum ou null), `agent_code`, `must_change_pin`, `points` (int), `zones` (ids M2M de zones), `is_verified`, `provider`, `community` (FK), `date_joined` (auto), `is_deleted`.
En écriture seule à la création : `password`, `incident_preferences` (liste, pour les élus).
> Deux notions d'organisation coexistent : `organisation` (ancienne chaîne libre) et `organisation_member` (vraie FK vers `Organisation`). Préférez `organisation_member` / `organisation_name`.

### Organisation (`OrganisationSerializer`, `fields=__all__`)
`id`, `name` (unique), `acronym`, `subdomain` (unique), `is_premium`, `logo` (url image), `organisation_type` (énum), `activity_sector` (énum), `intervention_country` (énum), `partner_status` (énum, défaut `active`), `description`, `phone`, `website_url`, `primary_color`/`secondary_color`/`background_color` (chaînes hex), `created_at` (auto), **`members_count`** + **`incidents_taken_count`** (lecture seule — incidents dont le leader `taken_by` appartient à l'org). Le `OrganisationMemberSerializer` (utilisé par les endpoints de membres **et `/agents/`**) expose un utilisateur ainsi : `id, email, first_name, last_name, phone, **avatar** (URL image), organisation_member, organisation_name, org_role, web_role, agent_code, is_active, date_joined`.

### Incident (`IncidentSerializer` écriture / `IncidentGetSerializer` lecture)
`id`, `title`, **`zone`** (chaîne, **obligatoire**), `description`, `photo` (image), **`thumbnail`** (URL image — **générée automatiquement** ~320px depuis `photo` à la sauvegarde, lecture seule ; à utiliser dans l'onglet incidents à la place de la `photo` complète), `video` (fichier), `audio` (fichier), `lattitude` (chaîne), `longitude` (chaîne), `etat` (énum, défaut `declared`), `user_id` (FK → utilisateur rapporteur), `category_id` (FK → Category), `indicateur_id` (FK → Indicateur), `category_ids` (M2M Category), `slug`, `taken_by` (FK → utilisateur leader, nullable), `take_in_charge_mode` (énum/null), `resolution_start_date`, `resolution_end_date` (dates ; les deux obligatoires pour clôturer), **`progress`** (0–100, lecture seule, auto depuis les tâches confirmées ; **un incident `resolved`/`resolved_definitive` est toujours à `100`** *(2026)* — même sans tâches — pour ne plus afficher `0` sur un incident résolu), `is_public` (défaut true), `is_deleted` (drapeau de suppression douce), `created_at` (auto). Calculé en lecture seule : `reported_by_agent` (bool — le rapporteur est un agent de terrain).
- **`IncidentGetSerializer`** imbrique les objets complets `user_id` (User) et `category_id` (Category) ; utilisé par la plupart des endpoints de liste.
- La prédiction IA (OneToOne `prediction`) est accédée via ses propres endpoints (voir §6.7), elle n'est pas intégrée ici.
- **Organisations actives (liste + détail)** *(2026)* — exposées par les deux sérialiseurs, pour qu'une autre organisation voie qui travaille déjà sur l'incident **avant** de l'ouvrir :
  - **`taken_by_organisation`** : `{id, name}` de l'organisation qui a pris l'incident en charge, ou `null`.
  - **`taken_by_name`** : nom complet de la personne qui a pris en charge (pas seulement l'id `taken_by`).
  - **`acting_organisations`** : `[{id, name, relation}]` — toutes les organisations actives ; `relation` ∈ `leader` (a pris en charge) · `assigned` (assignation super-admin acceptée) · `collaborator` (collaboration acceptée). Dédupliqué, relation la plus forte conservée. (Seules les collaborations **acceptées** y figurent.)
  - **`my_collaboration`** *(2026)* : la demande de collaboration **du viewer** (ou de son org) sur cet incident, **quel que soit son statut** — `{id, status(pending|accepted|declined), role, created_at, organisation_id, organisation_name}`, ou `null` si aucune. Permet d'afficher dans la liste « j'ai demandé à collaborer — en attente » sur un incident déjà dirigé par une autre org. **Rempli uniquement sur `GET /incident/`** (la liste principale, qui transmet le contexte de la requête) ; `null` ailleurs.
- **`org_assignments`** : `[{id, organisation_id, organisation_name, status, deadline}]` (assignations super-admin pending/accepted/declined).

### Collaboration (`CollaborationSerializer` / `CollaborationEnrichedSerializer`)
`id`, `incident` (FK), `user` (FK — l'utilisateur/représentant org qui collabore), `role` (énum), `status` (énum, lecture seule — défini via accept/decline), `motivation`, `end_date` (doit être future), `other_option`, `created_at` (auto). Unicité `(incident, user)`.
Enrichissements en lecture seule : `organisation_name`, `organisation_id`, `user_full_name`, `user_email`, `incident_title`, **`incident_photo`** *(2026)*, **`incident_thumbnail`** *(2026)* (URL de l'image de l'incident, pour les cartes de collaboration), `incident_details` (Incident complet), `prediction_details` (Prediction complète). Le sérialiseur dashboard ajoute `user_role`, `incident_description/zone/etat/progress`, **`incident_photo`/`incident_thumbnail`**, `start_date` (=created_at), `participants_count`.
- **`sender` / `receiver`** *(2026)* — parties explicites d'une demande de collaboration, chacune `{id, name, email, organisation_id, organisation_name}` : **`sender`** (émetteur) = l'organisation qui demande à rejoindre (`collaboration.user`) ; **`receiver`** (récepteur) = le leader qui reçoit la demande (`incident.taken_by`), ou `null` si aucun. À utiliser dans l'onglet « demande » pour que l'org connectée sache si elle a émis ou reçu la demande (ne pas déduire de `user` seul).

### IncidentTask (`IncidentTaskSerializer`, `fields=__all__`)
`id`, `incident` (**lecture seule — injecté depuis l'URL ; à NE PAS envoyer dans le corps**), `title` (obligatoire), `description`, `start_date`, `end_date` (obligatoires ; start ≤ end), `state` (énum), `proof_image`, `proof_video` (obligatoire quand `state=done`), `failure_reason` (obligatoire quand `state=failed`), `assigned_to` (FK User — **optionnel** ; omettre pour une tâche non assignée, ou envoyer un **UUID d'agent valide** — jamais un ancien id entier), `created_by` (auto = utilisateur courant), **`is_confirmed`** (lecture seule ; auto-true si créée par le leader ; seules les tâches confirmées comptent dans le `progress` de l'incident), `created_at`/`updated_at` (auto).

### PartnerSuggestion (`PartnerSuggestionSerializer`)
`id`, `incident` (FK), `suggested_by` (auto = utilisateur courant), `suggested_partner` (FK User — optionnel si `suggested_organisation` envoyé), `suggested_organisation` (id org en écriture seule → résolu vers l'admin/bureau de cette org), `suggested_role` (`contributor`|`observer`), `justification` (obligatoire), `status` (énum lecture seule). Noms en lecture seule : `incident_title`, `suggested_by_name`, `suggested_by_organisation`, `suggested_partner_name`, `suggested_partner_organisation`. Unicité `(incident, suggested_partner)`.

### IncidentAssignment (`IncidentAssignmentSerializer`)
`id`, `incident` (FK, depuis l'URL), `agent` (FK User — doit être `field_agent` dans l'org de l'incident), `assigned_by` (auto), **`deadline`** (datetime, **obligatoire**), `status` (énum), `created_at`/`updated_at`. Lecture seule : `agent_name/email/phone`, `incident_title`, `assigned_by_name/email`, `incident_detail` (incident complet). Unicité `(incident, agent)`.

### FieldReport (`FieldReportSerializer`)
`id`, `agent` (auto), `incident` (auto depuis le corps `incident`/`incident_id`), `location_lat`, `location_lon` (chaînes — doivent être à moins de 100 m de l'incident), `distance_meters` (auto), `notes`, `photo` (image), `visited_at`, `created_at`. Lecture seule : `agent_name`, `incident_title`, `incident_zone`.

### DiscussionMessage (`DiscussionMessageSerializer`)
`id`, `incident` (auto), `collaboration` (auto), `sender` (User imbriqué, lecture seule), `message` (texte), `audio` (fichier), `attachment` (pdf/doc/docx/xls/xlsx uniquement), `recipient` (User imbriqué, optionnel), `created_at`. Au moins un de `message`/`audio`/`attachment` est requis.

### Prediction (`PredictionSerializer`, `fields=__all__`, presque tout en lecture seule)
L'analyse IA/géo/impact d'un incident (OneToOne `incident`). Gros objet — champs clés qu'un frontend afficherait :
- Statut/méta : `id`, `prediction_id`, `incident` (FK), `status` (énum), `error_message`, `created_at`, `updated_at`.
- Classification : `incident_type`, `macro_category`, `sub_category`, `description`, `analysis`, `piste_solution`, `recommendation`.
- Gravité/impact : `global_impact_score` (float), `base_severity` (int), `impact_tags` (liste), `impact_radius_meters`, `radius_explanation`, `source_size_meters`, `spread_vectors` (liste).
- Géo : `latitude`, `longitude`, `city`, `region`, `country`, `display_name`.
- Exposition sociale/humaine : `social_vulnerability_score`, `total_population_exposed`, `adult_men_exposed`, `adult_women_exposed`, `children_exposed`, `health_centers`, `maternities`, `schools`, `nurseries`, `markets`, `water_points`, `main_roads_bridges`, `residential_buildings`.
- Blocs JSON bruts : `ai_analysis`, `topography`, `satellite`, `social_data`, `human_impact`, `geocoding`, `potential_risk`, `full_response`.
- Champs de tracé hérités : `ndvi_heatmap`, `ndvi_ndwi_plot`, `landcover_plot`, `legacy_incident_id`.

### Autres modèles de référence (tous `fields=__all__`)
- **Zone :** `id, name` (unique), `description`, `lattitude`, `longitude`, `photo`, `created_at`.
- **Category :** `id, name` (unique), `description`, `photo`, `created_at`.
- **Indicateur :** `id, name` (unique), `created_at`.
- **Rapport :** `id, details, type` (`"zone"` pour un rapport sur toute une zone), `incident` (FK), `zone` (chaîne), `user_id` (FK demandeur), `date_livraison`, `statut` (énum), `incidents` (M2M), `disponible` (bool), `file`, `created_at`.
- **Message :** `id, objet, message, zone` (FK), `communaute` (FK), `user_id` (FK élu destinataire), `created_at`. **ResponseMessage :** `id, response, message` (FK), `elu` (FK), `created_at`.
- **Communaute :** `id, name, zone` (FK), `created_at`.
- **Contact :** `id, objet, message, email, created_at`.
- **Evenement :** `id, title, zone, description, photo, date, lieu, video, audio, user_id` (FK organisateur), `latitude`, `longitude`, `created_at`.
- **Participate :** `id, evenement_id` (FK), `user_id` (FK), `created_at`.
- **Notification :** `id, user` (FK), `message`, `read` (bool), `colaboration` (FK Collaboration — noter l'orthographe), `created_at`.
- **UserAction :** `id, user` (FK), `action`, `timeStamp`.
- **ChatHistory :** par message `{incident, user, role, content, created_at}` (chat IA de l'incident, par utilisateur via `incidents/<id>/chat/`). Les anciennes colonnes `{session_id, question, answer}` sont dépréciées/inutilisées — leurs endpoints ont été supprimés.

---

## 5. Modèle de rôles & permissions

Les permissions de collaboration (`permissions.py`) déterminent le **leader** d'un incident ainsi : un utilisateur avec une `Collaboration(role='leader')` `accepted`, **ou** `incident.taken_by == user`. Classes personnalisées :

| Permission | Autorise |
|---|---|
| `IsIncidentLeader` | le leader uniquement |
| `IsIncidentCollaborator` | tout collaborateur `accepted` (leader/contributor/observer) ou `taken_by` — **+ en mode `internal`, tout membre de l'org propriétaire (org de `taken_by`)** *(2026)* |
| `IsIncidentContributor` | un `contributor` accepté (lecture ouverte à tous les collaborateurs) — **+ membres de l'org propriétaire en mode interne** *(2026)* |
| `IsIncidentLeaderOrContributor` | leader ou contributeur accepté (création de tâches/suggestions) — **+ membres de l'org propriétaire en mode interne** *(2026)* |
| **Visibilité mode interne** *(2026)* | En `take_in_charge_mode='internal'`, **tout membre de l'org qui a pris l'incident en charge** (admin **et agents de bureau**) est traité comme collaborateur — il peut voir/travailler ses sous-ressources (tâches, suggestions, discussion), pas seulement le seul `taken_by`. Corrige les `403/404` des agents de bureau sur les incidents internes de LEUR org. **Les actions réservées au leader (confirmer une tâche, déclarer/valider la résolution) restent au `taken_by`.** |
| `IsIncidentLeaderOrReadOnlyCollaborator` | lecture = tout collaborateur ; écriture = leader |
| `IsSuperAdmin` | `is_superuser` (corbeille, restauration groupée, suppression définitive, relance de prédiction) |
| `IsSuperAdminOrOrgOwnIncident` | super admin → tout incident ; membre d'org → seulement les incidents rapportés/pris en charge par son org (utilisé pour la suppression) |

Les endpoints de membres d'organisation ajoutent un contrôle sur `org_role` : `org_admin` et `bureau_agent` gèrent les membres ; seul `org_admin` crée du personnel (staff) ; `is_staff` court-circuite les contrôles d'org.

---

## 6. Endpoints par domaine

Légende — Auth : **aucune** (public), **Bearer** (tout utilisateur authentifié), ou une permission/un rôle spécifique.

### 6.1 Utilisateurs & organisations

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET /MapApi/user/` · `POST /MapApi/user/` | aucune | Liste paginée / création d'utilisateur. POST optionnel `zones` (ids), `user_type` ; envoie un email de bienvenue quand `user_type` est défini. |
| `GET·PUT·DELETE /MapApi/user/<id>/` | Bearer | Récupération/màj/suppression d'un utilisateur. PUT hashe `password` si présent. **Authentification + contrôle de rôle *(2026)*** — auparavant entièrement public. **GET** : tout utilisateur authentifié. **PUT** : soi-même, l'**admin de l'organisation de cet utilisateur**, ou le super admin → sinon `403`. **DELETE** : super admin (n'importe qui) · admin d'organisation (les membres de SON organisation, jamais un super admin) · **agent de bureau (uniquement les `field_agent` de son organisation — jamais un admin)** · autres rôles `403`. Corrige la faille où un agent de bureau (ou n'importe qui) pouvait supprimer/modifier n'importe quel utilisateur. |
| `GET /MapApi/user_retrieve/` | Bearer | Utilisateur courant (voir §2). |
| `GET /MapApi/citizen/` | aucune | Utilisateurs avec `user_type=citizen` (taille de page 10). |
| `GET /MapApi/updatePoint/` | aucune | Recalcule `points` pour tous les utilisateurs (maintenance admin). |
| `GET /MapApi/tenant-config/` | aucune | Thématisation par sous-domaine : `{name, subdomain, logo_url, primary_color, secondary_color, background_color, is_premium}`. Résout l'org depuis le sous-domaine de la requête. |
| `GET·POST /MapApi/organisations/` | GET aucune ; **POST** Super Admin | Liste (paginée, **plus récentes d'abord**) / création. **Création : `name` + `subdomain` (unique) obligatoires.** Filtres liste : `?search=` (nom/acronyme/subdomain/pays), `?activity_sector=`, `?organisation_type=`, `?partner_status=active\|inactive`. Chaque ligne porte `members_count` + `incidents_taken_count`. |
| `GET /MapApi/organisations/stats/` *(2026)* | aucune | Cartes du dashboard : `{total, active, inactive, incidents_taken_total}`. |
| `GET·PUT·PATCH·DELETE /MapApi/organisations/<pk>/` | aucune | RUD d'organisation. |
| `GET /MapApi/organisations/<pk>/detail/` | aucune | Org + `stats` : `{member_count, field_agents_count, bureau_agents_count, admins_count, incident_count, resolved_incident_count}`. |
| `GET /MapApi/organisations/<pk>/members/` | Bearer + org_admin/bureau ou staff | Liste des membres (`OrganisationMemberSerializer`). |
| `POST /MapApi/organisations/<pk>/members/add/` | Bearer + org_admin/bureau ou staff | `{user_id, org_role}` → rattache un utilisateur existant. Les nouveaux agents de terrain renvoient un `initial_pin` unique. |
| `PATCH·DELETE /MapApi/organisations/<pk>/members/<user_id>/` | Bearer | Modifie (`email, first_name, last_name, phone, org_role`) / retire un membre. **PATCH** = admin de cette org ou super admin. **DELETE** = admin d'org / super admin (n'importe quel membre) **ou un agent de bureau de cette org — mais l'agent de bureau ne peut supprimer qu'un `field_agent`** *(2026)* (supprimer un admin/bureau → `403 "Un agent de bureau ne peut supprimer qu'un agent de terrain."`). **Anti-verrouillage : impossible de retirer/rétrograder le dernier admin actif (`400`) ; un Super Admin peut outrepasser.** |
| `POST /MapApi/organisations/<pk>/agents/create/` | Bearer + org_admin/bureau ou staff | Crée un agent de terrain en un appel `{first_name,last_name,email,phone,address?}` → renvoie `initial_pin`, `must_change_pin`, envoie les identifiants par email. |
| `POST /MapApi/organisations/<pk>/staff/create/` | Bearer + org_admin ou staff | Crée du personnel `{first_name,last_name,email,org_role(org_admin|bureau_agent),phone?,address?}` → renvoie **`temp_password`** (à afficher pour que l'admin le communique — la délivrabilité de l'email n'est pas garantie), plus `email_sent`, `must_change_password:true`. |
| `GET /MapApi/agents/` *(2026)* | Bearer | Liste des agents, **plus récents d'abord**, paginée. **Filtrée par rôle : le Super Admin voit les agents de toutes les organisations ; un admin/membre d'org ne voit que ceux de SON organisation** (plus de `403` cross-org). Filtres : `?search=` (nom/email/org), `?role=org_admin\|bureau_agent\|field_agent`, `?status=active\|inactive`. Lignes = `OrganisationMemberSerializer`. **À utiliser au lieu de boucler sur `organisations/<id>/members/` pour chaque org** — cette route par-org renvoie `403` pour les orgs auxquelles on n'appartient pas. |
| `GET /MapApi/agents/stats/` *(2026)* | Bearer | Cartes du dashboard agents : `{total, active, admins, bureau_agents, field_agents}`. **Même portée par rôle que `/agents/`** (Super Admin = global, admin d'org = sa propre org). |
| `GET·POST /MapApi/elu/<id>` *(sans slash)* | aucune | Liste/crée des élus (`user_type=elu`) ; la création envoie les identifiants par email. |
| `GET·POST /MapApi/elu/` | aucune | `EluToZone` : `POST {elu, zone}` rattache une zone à un élu. |

### 6.2 Incidents — CRUD & récupération

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET·POST /MapApi/incident/` | aucune | Liste paginée **(20/page** ; `?page=&page_size=`, max 100). **Filtres : `?search=` (titre/description/zone), `?etat=<statut>`, `?severity=<niveau>`** (combinables). (`IncidentGetSerializer`, avec `thumbnail`) / **création**. Création : champs `IncidentSerializer`, **`zone` obligatoire**, multipart pour `photo/video/audio`. Effets de bord : get-or-create de la Zone, +1 point au rapporteur, lance la `Prediction` IA si une `photo` existe. |
| `GET·PUT·DELETE /MapApi/incident/<id>` *(sans slash)* | GET/PUT aucune ; **DELETE** `IsSuperAdminOrOrgOwnIncident` | Récupération / màj complète / **suppression douce** (`is_deleted=true`, `204`). PUT envoie des emails de statut quand `etat` devient `resolved`/`in_progress` (PUT exige une clé `etat` dans le corps). |
| `GET /MapApi/incidentByZone/<zone>/` | aucune | Tous les incidents d'une zone numérique (liste simple). |
| `GET /MapApi/my-incidents/` | Bearer | Incidents rapportés par l'utilisateur courant. |
| `GET /MapApi/my-interventions/` *(2026)* | Bearer | Incidents sur lesquels l'utilisateur/son org **travaille** (pris en charge perso/org, assignation org acceptée, collaboration acceptée, ou agent assigné). Chaque incident (`IncidentGetSerializer`) + **`assigned_agents`** `[{id,name,email,phone,org_role,organisation_id,organisation_name,assignment_status,deadline}]` + **`reports_count`**. |
| `GET /MapApi/org-incidents/` | Bearer | **« Mes interventions »** — ce que gère l'**org** de l'appelant, **limité à son org** *(2026 — auparavant tous les incidents internes de toutes les orgs fuitaient)*. **`?source=`** *(défaut `agents_or_internal`)* : **`agents_or_internal`/`all`** = union de (pris en charge **EN INTERNE** par mon org : `take_in_charge_mode='internal'` ET `taken_by`∈mon org) **+** (incidents **signalés par mes agents de terrain**) ; **`internal`** (ou `?mode=internal`) = interne uniquement ; **`agents`** = signalés par mes agents uniquement ; **`citizens`** = incidents internes de mon org signalés par des non-agents. **Les collaborations sont exclues** (mode `collaborative` / dirigées par une autre org → voir « Mes collaborations »). Chaque incident porte aussi **`reports_count`** *(2026)* = nombre de rapports de terrain (`FieldReport`) des agents de **ton org** sur cet incident (même portée que `/field-reports/?incident=`). **Filtres** *(2026)* : **`?search=`** (titre/description/zone) et **`?status=`** (=`?etat=`; ex. `taken_into_account`, `resolved`) — combinables avec `?source=`. Paginé (20/page). |
| `GET /MapApi/incident-filter/` | aucune* (Bearer pour `scope=mine`) | Liste légère pour la carte, avec **`severity`**. `?scope=all\|mine\|resolved\|unresolved` *(2026, un seul URL pour la carte du dashboard ; `mine`=incidents sur lesquels l'org agit)* + `?filter_type=today\|yesterday\|last_7_days\|last_30_days\|this_month\|last_month\|custom_range` (+ `custom_start`,`custom_end`). scope et filter_type se combinent. |
| `GET /MapApi/Search/` | aucune* | `?search_term=` (obligatoire) — recherche dans titre/description. |
| `GET /MapApi/incidentDetail/<incident_id>` *(sans slash)* | Bearer | `{status, user: <taken_by User>}`. |

\* ne déclare aucune `permission_classes` ; sans défaut global, c'est de fait public.

### 6.3 Incidents — cycle de vie

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `POST /MapApi/incidents/<id>/take_in_charge/` | Bearer | Corps `{mode: "internal"|"collaborative", role?}`. Internal → définit `taken_by`, `etat=taken_into_account`, crée une Collaboration leader acceptée. Collaborative → rôle `leader`/`contributor`/`observer` ; crée une Collaboration avec statut selon les règles. Nombreux garde-fous `400` (déjà pris, clôturé, collab en double, leader existant). |
| `POST /MapApi/hadleIncident/<incident_id>` *(typo, sans slash)* | Bearer | Avancement de statut hérité. Corps `{action: "taken_into_account"|"resolved"}` ; impose l'ordre ; journalise une `UserAction`. |
| `POST /MapApi/incidents/<id>/close/` | Bearer + `IsIncidentLeader` | `{resolution_start_date, resolution_end_date}` → `etat=resolved`. Bloqué (`400`) si une tâche n'est pas `done`/`failed`. |
| `POST /MapApi/incidents/<id>/toggle-public/` | Bearer (org_admin/bureau sur son incident, ou staff) | Inverse `is_public`. |
| `GET /MapApi/incidents/<id>/prediction/` | Bearer | La `Prediction` de l'incident. `404` si aucune. |
| `POST /MapApi/incidents/<id>/prediction/retry/` | Bearer + `IsSuperAdmin` | Relance l'analyse IA (`202`). |
| `GET·POST /MapApi/incidents/<id>/chat/` | Bearer | Assistant IA ancré sur la prédiction (historique **par utilisateur connecté**). GET → `{history:[{id,role,content,created_at,user_id}]}`. **Pagination curseur** *(2026)* : sans paramètre = historique complet (chronologique) ; **`?limit=N`** (1–100) = les N messages les plus récents (ordre chronologique) + **`has_more`** + **`next_before`** ; pour les plus anciens (scroll vers le haut), rappeler avec **`?before=<id du plus ancien message chargé>`** (`+limit`). POST `{message}` → `{message, history}`. `502` si le service du modèle échoue. |

### 6.4 Collaborations

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET·POST /MapApi/collaboration/` | Bearer | Liste. **`?scope=self\|received\|all`** *(2026, défaut `all`)* : **`self`** = mes propres collaborations (onglet « Mes collaborations » — une carte par incident avec **mon** rôle) ; **`received`** = demandes faites par d'autres sur les incidents que **je dirige** (onglet « Demandes ») ; **`all`** = les deux. **Le Super Admin voit TOUTES les collaborations de la plateforme** *(2026)* — le `scope` est ignoré pour lui (les filtres `status`/`role`/`incident_id` s'appliquent toujours). Autres filtres `?status=&role=&incident_id=`. **POST réservé à un membre opérationnel d'organisation — Admin d'organisation OU agent de bureau** *(2026 ; les agents de bureau recevaient auparavant `403`)* ; les autres rôles authentifiés `403`. POST `{incident, role(contributor\|observer), motivation?, end_date?}` — `leader` rejeté (un agent de bureau ne peut donc jamais prendre un incident en charge via cette route). Garde anti-doublon *(2026)* : bloque uniquement si une collaboration **active** (`pending`/`accepted`) existe déjà → `400 "…déjà une collaboration active…"` ; une collaboration précédemment **refusée/terminée** **peut être relancée** (l'ancienne ligne est remplacée et le leader re-notifié). **Ne PAS envoyer `user` — il est forcé côté serveur à l'utilisateur authentifié (lecture seule) ; envoyer un mauvais `user` provoquait `400 Invalid pk`.** |
| `GET·PATCH·DELETE /MapApi/collaboration/<pk>/` | Bearer | RUD de collaboration. **GET (lecture) :** le propriétaire, le leader de l'incident, **le staff d'org (admin/agent de bureau) pour toute collaboration de SON org** *(2026 — créée par un membre de son org ou sur un incident dont son org est leader ; corrige les `404` des agents de bureau sur les collaborations de leur org)*, ou le super admin. **PATCH/DELETE (écriture) :** uniquement le propriétaire, le leader de l'incident, ou le super admin — un agent de bureau ne peut pas modifier la collaboration d'un autre membre (`404`). |
| `POST /MapApi/collaborations/bulk-request/` | Bearer | `{requests:[{incident_id, role, motivation, end_date}, ...]}` → `201`/`207`, `created`/`errors` par élément. |
| `GET /MapApi/collaborations/dashboard/` | Bearer | Liste enrichie, **paginée** *(2026)* — `{count, next, previous, results}` (`?page=&page_size=`, comme `/collaboration/` ; auparavant un tableau brut). **`?scope=self\|received\|all`** *(2026, défaut `all`)* — même sens que sur `/collaboration/` (`self` pour « Mes collaborations », `received` pour « Demandes ») ; **le Super Admin voit TOUTES les collaborations de la plateforme** *(2026, `scope` ignoré pour lui)*. Filtres `?status=all\|in-progress\|completed\|pending\|accepted\|declined`, `?date_from=&date_to=&search=`. |
| `POST /MapApi/accept-collaboration/` · `POST /MapApi/collaborations/accept/` | Bearer + leader | `{collaboration_id}` → `accepted`. |
| `POST /MapApi/decline/` | Bearer + leader | `{collaboration_id}` → `declined`, envoie un email au demandeur. |
| `POST /MapApi/collaboration/<id>/<action>/` | Bearer + leader | `<action>` = `accept`/`reject`. |

### 6.5 Tâches (par incident)

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET·POST /MapApi/incidents/<id>/tasks/` | Bearer + `IsIncidentLeaderOrContributor` | Liste / création. Corps `{title, start_date, end_date, description?, assigned_to?, state?}`. **`incident` vient de l'URL — ne pas l'envoyer** (*2026* : lecture seule ; évite l'ancien `400 "incident may not be null"`). **`assigned_to` est optionnel — l'omettre ou envoyer un UUID d'agent valide, jamais un entier** (`"6"` → `400 Invalid pk`). Les tâches créées par le leader sont auto-`is_confirmed`. |
| `GET·PUT·PATCH·DELETE /MapApi/incidents/<id>/tasks/<pk>/` | lecture : tout collaborateur ; **écriture (PUT/PATCH/DELETE) : leader OU contributeur accepté** *(2026 — avant : leader uniquement ; les observateurs restent en lecture seule)* | RUD de tâche. **`DELETE` 404 = mauvais `incident_id` dans l'URL** (utilise l'UUID `incident` de la tâche) ; un delete contributeur avec la bonne URL renvoie `204`. |
| `POST /MapApi/incidents/<id>/tasks/<pk>/complete/` | Bearer + **`IsIncidentLeaderOrContributor`** *(2026 — avant : leader uniquement)* | multipart `proof_image` et/ou `proof_video` (≥1 requis) → `state=done`. Un **contributeur** (celui qui fait le travail) peut compléter avec une preuve ; le leader garde la main via `is_confirmed`. |
| `POST /MapApi/incidents/<id>/tasks/<pk>/fail/` | Bearer + **`IsIncidentLeaderOrContributor`** *(2026)* | `{failure_reason}` → `state=failed`. |
| `POST /MapApi/incidents/<id>/tasks/<pk>/confirm/` | Bearer + `IsIncidentLeader` | Confirme une tâche créée par un contributeur (compte dans le `progress`). |

### 6.6 Suggestions de partenaires (par incident)

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET·POST /MapApi/incidents/<id>/suggestions/` | Bearer + `IsIncidentLeaderOrContributor` | Filtre `?status=`. POST `{suggested_partner | suggested_organisation, suggested_role(contributor|observer), justification}`. |
| `GET /MapApi/incidents/<id>/suggestions/<pk>/` | Bearer + collaborateur | Récupération. |
| `POST /MapApi/incidents/<id>/suggestions/<pk>/accept/` | Bearer + `IsIncidentLeader` | Accepte → crée une Collaboration acceptée pour le partenaire. |
| `POST /MapApi/incidents/<id>/suggestions/<pk>/reject/` | Bearer + `IsIncidentLeader` | Rejette. |
| `GET /MapApi/my-suggestions/received/` | Bearer | Suggestions où je suis le partenaire proposé. `?status=`. |
| `GET /MapApi/my-suggestions/sent/` | Bearer | Suggestions que j'ai créées. `?status=`. |

### 6.7 Assignations, rapports de terrain, discussion

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET·POST /MapApi/incidents/<id>/assignments/` | Bearer + gestion (staff ou org_admin/bureau sur son incident) | Liste / **assigne un agent de terrain** (`{agent, deadline, ...}`). POST envoie un email à l'agent. |
| `GET·PUT·PATCH·DELETE /MapApi/incidents/<id>/assignments/<pk>/` | Bearer + gestion | RUD d'assignation. |
| `GET /MapApi/agent/assigned-incidents/` | Bearer | Assignations de l'**agent de terrain** courant (GET seulement). |
| `GET /MapApi/incidents/<id>/reports/` *(2026)* | Bearer | Tous les rapports d'agents d'un incident (`Rapport` via FK **ou** M2M), chacun `{id, details, type, statut, date_livraison, disponible, file, created_at, author:{id,name,email,organisation_id,organisation_name}}`. Sert la vue rapports de « Mes interventions » **et** la colonne rapports du détail de collaboration (rapports de chaque org travaillant sur l'incident). |
| `GET·POST /MapApi/field-reports/` | Bearer (POST : agents de terrain sur incidents assignés) | Liste (limitée par rôle : staff→tous, agent terrain→les siens, sinon→ceux de son org) / crée un rapport de visite terrain (`FieldReport` = rapport d'un agent sur place : GPS, distance, notes, `photo`, `visited_at`). **GET `?incident=<uuid>`** *(2026)* → uniquement les rapports terrain de cet incident. **Paginé** *(2026)* : `{count, next, previous, results}`, **10/page** (`?page=`, `?page_size=`) — pour un bouton « charger plus », suivre `next` jusqu'à `null`. POST multipart `photo` ; passe l'assignation à `reported`. |
| `GET·POST /MapApi/discussion/<incident_id>/` | Bearer + collaborateur accepté | Chat de groupe par incident. GET : sans paramètre = liste complète (tableau, ordre chronologique). **Pagination curseur** *(2026)* : **`?limit=N`** (1–100) = les N messages les plus récents, renvoyés sous **`{messages:[…], has_more, next_before}`** ; pour les plus anciens (scroll vers le haut), rappeler avec **`?before=<id du plus ancien message chargé>`** (`+limit`). Chaque message a un **`id`** (le curseur). POST multipart `{message?, audio?, attachment?, recipient?}` (≥1 de message/audio/attachment). Bloqué une fois l'incident `resolved`. |

### 6.8 Statistiques d'incidents (dashboards/graphiques)

Toutes publiques (`permission_classes=()`) ; renvoient des agrégats JSON, pas des listes paginées.

| Méthode · Chemin | Renvoie |
|---|---|
| `GET /MapApi/incidentResolved/` | Incidents paginés avec `etat=resolved`. |
| `GET /MapApi/incidentNotResolved/` | Incidents paginés avec `etat=declared`. |
| `GET /MapApi/incidentByMonth/` `?month=` | `{status,message,data:[Incident...]}` pour l'année (optionnellement un mois). |
| `GET /MapApi/incidentByMonth_zone/<zone>` *(sans slash)* | Par mois `{month,total,resolved,unresolved}` pour une zone. |
| `GET /MapApi/IncidentOnWeek/` | Par jour `{day,total,resolved,unresolved}` pour la dernière semaine. |
| `GET /MapApi/IncidentOnWeek_zone/<zone>` *(sans slash)* | Ventilation hebdomadaire par jour pour une zone. |
| `GET /MapApi/indicator_incident/` | `{data:[{indicateur, number, pourcentage}]}` (part des incidents par indicateur). |
| `GET /MapApi/indicator_incident_zone/<zone>` · `GET /MapApi/indicator_incident_elu/<id>` | Idem, par zone / par id de rapporteur. |

### 6.9 Prédictions (autonomes, publiques)

| Méthode · Chemin | Notes |
|---|---|
| `GET /MapApi/prediction/` | Toutes les prédictions. |
| `GET /MapApi/prediction/<id>/` | Par `prediction_id` (liste). |
| `GET /MapApi/Incidentprediction/<incident_id>/` | Par id d'incident (liste) — ce qu'appelle le `getIncidentPredictionService` du frontend. |

### 6.10 Notifications & historique

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET /MapApi/notifications/` | Bearer | **Toutes** les notifications de l'utilisateur, **plus récentes d'abord**, paginées (20/page ; `?page=&page_size=`). Chacune a **`type`** + **`title`** *(2026 — libellé FR prêt à afficher ; ne pas coder le titre en dur)*, **`incident_title`**, `message`, et un **`link`** (cible de redirection, cf. §6.14). Filtre `?read=true\|false` (`?read=false` → `count` = nombre de non lues). |
| `GET /MapApi/activity-feed/` *(2026)* | Bearer | Activité de la plateforme **hors organisation de l'utilisateur**, plus récente d'abord, paginée. Éléments : `{id, action, user, user_name, organisation_name, actor, created_at, timeStamp}`. **`actor`** *(2026)* = à afficher en préfixe (gras) = le **nom de l'organisation** (l'activité est au niveau org), avec repli sur la personne si pas d'org → **utilise `actor`, pas `user_name`**. **`action`** est une phrase verbale **en français, sans l'acteur et avec le titre de l'incident** *(2026 — certaines étaient en anglais et affichaient l'UUID brut)*, ex. *« a pris en charge l'incident «…» en mode interne. »* — à afficher comme `{actor} {action}`. Sourcé depuis `UserAction`. **Temps réel :** aussi poussé via `wss://<api>/ws/activity-feed/` *(2026)* — voir la table WebSocket. |
| `GET /MapApi/user_action/` | Bearer | Journal d'actions de l'utilisateur courant. |

### 6.11 Corbeille & actions groupées (super admin)

| Méthode · Chemin | Auth | Notes |
|---|---|---|
| `GET /MapApi/incidents/trash/` | Bearer + `IsSuperAdmin` | Incidents en suppression douce. |
| `POST /MapApi/incidents/<id>/restore/` | Bearer + `IsSuperAdmin` | Restaure un incident. |
| `POST /MapApi/incidents/bulk-delete/` | Bearer (contrôle de propriété par incident) | `{incident_ids:[...]}` → suppression douce ; renvoie `deleted_ids/unauthorized_ids/not_found_ids`. |
| `POST /MapApi/incidents/bulk-restore/` | Bearer + `IsSuperAdmin` | Restaure en masse. |
| `POST /MapApi/incidents/bulk-force-delete/` | Bearer + `IsSuperAdmin` | **Suppression définitive** en masse (irréversible). |

### 6.12 CRUD des données de référence (majoritairement publiques)

Liste/création standard sur la collection et récupération/màj/suppression sur `/<id>` (pas de slash de fin sur la route d'id). Toutes en `permission_classes=()` sauf indication.

- **Catégories :** `GET·POST /MapApi/category/`, `GET·PUT·DELETE /MapApi/category/<id>` (suppression bloquée si des incidents la référencent).
- **Indicateurs :** `GET·POST /MapApi/indicator/`, `GET·PUT·DELETE /MapApi/indicator/<id>`.
- **Zones :** `GET·POST /MapApi/zone/`, `GET·PUT·DELETE /MapApi/zone/<id>`.
- **Rapports :** `GET·POST /MapApi/rapport/`, `GET·PUT·DELETE /MapApi/rapport/<id>` (PUT avec `disponible`/`file` envoie un email au demandeur), `GET /MapApi/rapport_user/<id>`, `GET·POST /MapApi/rapport_zone/` (les rapports de zone rattachent automatiquement tous les incidents de la zone).
- **Messages :** `GET·POST /MapApi/message/`, `GET·PUT·DELETE /MapApi/message/<uuid:id>`, `GET /MapApi/message/<zone>` (par nom de zone), `GET /MapApi/message_user/<id>/`. **Réponses :** `GET·POST /MapApi/response_msg/`, `GET·PUT·DELETE /MapApi/response_msg/<id>`.
- **Communautés :** `GET·POST /MapApi/community/`, `GET·PUT·DELETE /MapApi/community/<id>`.
- **Contacts :** `GET·POST /MapApi/contact/`, `GET·PUT·DELETE /MapApi/contact/<id>` (POST envoie un email aux admins).
- **Événements :** `GET·POST /MapApi/Event/`, `GET·PUT·DELETE /MapApi/Event/<id>` (multipart `photo/video/audio` ; `user_id` obligatoire, +2 points).
- **Participations :** `GET·POST /MapApi/participate/`, `GET·PUT·DELETE /MapApi/participate/<id>` (+1 point).
- **Images de fond :** `GET·POST /MapApi/image/` (le GET renvoie la plus récente, curieusement en `201`), `GET·PUT·DELETE /MapApi/image/<id>`.
- **POIs Overpass :** `GET /MapApi/overpass/?latitude=&longitude=` → `[{amenity,name}]` dans un rayon de 500 m (mis en cache). `400` si coords manquantes/invalides, `503` si OSM en amont est indisponible.

### 6.13 IVR (voix Twilio) — non utilisé par le dashboard

`POST /MapApi/ivr/webhook/`, `ivr/select-zone/`, `ivr/select-category/`, `ivr/record-description/`, `ivr/process-recording/`, `ivr/recording-status/` sont des webhooks Twilio renvoyant du TwiML XML (les citoyens signalent des incidents par téléphone ; crée automatiquement un User + un Incident depuis l'appel). Pertinents pour le dashboard, en lecture seule : `GET /MapApi/ivr/calls/` et `GET /MapApi/ivr/calls/<call_id>/`.

### 6.14 WebSockets — temps réel *(2026)*

Django Channels sur le même hôte (`wss://` en prod, `ws://` en local). **Auth = le cookie d'accès httpOnly** (envoyé automatiquement au handshake ; ou `?token=<jwt>` pour le mobile). Les connexions d'une Origin non autorisée sont rejetées. Le serveur pousse du JSON ; le client n'a rien à envoyer.

| Chemin WS | Push |
|---|---|
| `wss://<api>/ws/notifications/` | `{event:'notification', id, type, title, message, incident_title, read, colaboration, incident, link, created_at}` — notifications de l'utilisateur connecté en temps réel. **`type`** *(2026)* = catégorie (`collaboration_request`, `collaboration_accepted`, `collaboration_declined`, `deadline_warning`, `incident_report`, `incident_assignment`) pour icône/logique ; **`title`** *(2026)* = libellé FR prêt à afficher (**à utiliser au lieu d'un titre en dur**) ; **`incident_title`** = nom de l'incident. **`link`** = `{type:'incident'\|'collaboration', incident_id, collaboration_id?, url}` ou `null` — cible de redirection au clic. Les mêmes champs `type`/`title`/`incident_title`/`link` sont sur le REST `GET /notifications/`. |
| `wss://<api>/ws/incidents/<id>/discussion/` | `{event:'discussion_message', id, incident, collaboration, sender, message, created_at}` — nouveaux messages de discussion de l'incident. |
| `wss://<api>/ws/incidents/<id>/tasks/` | `{event:'task_created'|'task_updated', id, incident, title, state, assigned_to, updated_at}` — changements de tâches de l'incident. **Aussi `{event:'task_deleted', id, incident}`** *(2026)* à la suppression d'une tâche (pour que la carte disparaisse en direct, pas seulement au refetch). |
| `wss://<api>/ws/collaborations/` *(2026)* | `{event:'collaboration_created'|'collaboration_updated', id, incident, incident_title, status, role, sender, sender_name, sender_organisation, created_at}` — collaborations de l'utilisateur connecté en temps réel, poussées à l'**émetteur** ET au **leader de l'incident**. **`incident_title`, `sender_name`, `sender_organisation`** *(2026)* permettent d'afficher l'élément sans refetch (ex. *« {sender_organisation} a demandé à collaborer sur «{incident_title}» »*) ; `status` passe de `pending` à `accepted`/`declined`. À souscrire sur l'onglet collaboration / demandes. |
| `wss://<api>/ws/activity-feed/` *(2026)* | `{event:'activity', id, action, user, user_name, organisation_name, organisation_id, actor, created_at, timeStamp}` — flux d'activité de la plateforme en temps réel. **`actor`** = nom de l'org (repli personne) à afficher en préfixe — `{actor} {action}`. **Filtré côté serveur comme le REST `GET /activity-feed/`** : chaque utilisateur ne reçoit que l'activité des **autres** organisations (celle de sa propre org est exclue). Ajoute les nouveaux éléments en tête du flux à la réception. |

Helper frontend : `src/hooks/useWebSocket.js` (reconnexion auto). Utilisé dans `Header` (notifications) et `CollaborationDetail` (discussion + tâches) pour déclencher un rafraîchissement instantané ; le polling HTTP reste en secours.

---

## 7. Notes d'intégration frontend

Comment cela correspond au code existant dans `dashboard/`, plus les divergences à vérifier :

1. **L'authentification est déjà correctement câblée.** `authService.login` → `POST /MapApi/login/` puis `GET /MapApi/user_retrieve/` ; rafraîchissement → `POST /MapApi/token/refresh/` ; les flux de mot de passe correspondent au §2. Le token d'accès de 90 jours explique les sessions longue durée.
2. **`createAuthenticatedAxios()` est correct** — `Authorization: Bearer <access>` est exactement ce qu'attendent les endpoints protégés.
3. **Mise à jour d'incident — URL probablement erronée.** `updateIncidentService` fait `PUT /MapApi/incidents/<id>/` (pluriel, slash final). La mise à jour d'incident côté backend est `PUT /MapApi/incident/<id>` (**singulier, sans slash**). La route plurielle n'existe pas → attendez-vous à un `404`. Utilisez `incident/<id>` et incluez un champ `etat` (la vue lit `request.data['etat']`).
4. **Assignation d'agent — vérifier l'endpoint.** `assignIncidentToAgentService` fait un POST vers `/MapApi/agent/assigned-incidents/`, mais cette route est en **GET seulement** (liste les assignations d'un agent de terrain). Pour **créer** une assignation, faites un POST vers `/MapApi/incidents/<id>/assignments/` avec `{agent, deadline}`. La forme GET est correcte pour lister.
5. **Méthode de `changePassword`.** Le frontend utilise `POST` ; la vue backend `change_password` est une `UpdateAPIView` (`PUT`/`PATCH`). Confirmez ce que le serveur déployé accepte.
6. **La création d'incident** doit être en **`multipart/form-data`** avec **`zone` obligatoire** (déjà géré via `FormData` dans `createIncidentService`).
7. **Les valeurs de `etat`** (`declared`, `taken_into_account`, `in_progress`, `resolved`) correspondent aux maps de libellé/couleur du frontend dans `incident_service.jsx`. Notez que le backend expose aussi `take_in_charge_mode` (internal/collaborative) et un `progress` calculé côté serveur (0–100) que vous pouvez afficher directement.
8. **Les notifications** (`getNotifications` dans le header) ne renvoient que les notifications liées à une collaboration **en attente** — c'est en pratique un fil de « demandes de collaboration en attente », pas un centre de notifications général.
9. **Deux champs « organisation »** existent sur un utilisateur : l'ancienne chaîne libre `organisation` et la vraie FK `organisation_member` (+ `organisation_name` en lecture seule). Le frontend stocke actuellement `userData.organisation` ; préférez `organisation_member`/`organisation_name` pour les fonctionnalités d'org.
10. **Des endpoints publics exposent des données.** Les données de référence, les listes d'utilisateurs et la plupart des stats d'incidents ne nécessitent aucun token. Ne comptez pas sur l'API pour masquer quoi que ce soit ; protégez les vues sensibles côté frontend et considérez `gettoken_bymail/` (token à partir du seul email) ainsi que la clé de signature JWT codée en dur dans le backend comme des faiblesses de sécurité connues.
11. **« Inviter des organisations » envoie `suggested_organisation`, pas `suggested_partner`** *(corrigé 2026-06)*. Le formulaire d'invitation choisit une **organisation** : le POST de suggestion doit donc envoyer `suggested_organisation: <orgId>` (le backend en déduit l'admin/bureau de l'org). Envoyer l'id d'org dans `suggested_partner` (une FK **User**) provoque `Invalid pk`. À noter : `PartnerSuggestion` a un `unique_together (incident, suggested_partner)`, donc `PartnerSuggestionSerializer` surcharge `get_unique_together_validators()` en `[]` et vérifie l'unicité dans `validate()` — sinon le `UniqueTogetherValidator` auto de DRF rend `suggested_partner` obligatoire et bloque la voie `suggested_organisation`. Frontend : `suggestCollaborationPartnerService` + `IncidentDetail.handleJoinSubmit` + `CollaborationDetail`.

---

*Produit à partir d'une étude du backend `223MapAction/Mapapi`. En cas de doute, le schéma OpenAPI en direct (`/MapApi/api/schema/`, Swagger sur `/MapApi/schema/swagger-ui/`) est la source de vérité en cours d'exécution ; ce fichier ajoute le comportement, les permissions et la correspondance frontend que le schéma généré omet.*
