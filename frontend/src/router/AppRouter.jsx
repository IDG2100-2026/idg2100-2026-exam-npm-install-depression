import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import NotFoundPage from '../../pages/NotFoundPage.jsx';

import HomePage from '../../pages/HomePage.jsx';
import LobbyPage from '../../pages/LobbyPage.jsx';
import CreateGamePage from '../../pages/CreateGamePage.jsx';
import GamePage from '../../pages/GamePage.jsx';
import TournamentListPage from '../../pages/TournamentListPage.jsx';
import TournamentPage from '../../pages/TournamentPage';
import LoginPage from '../../pages/LoginPage.jsx';
import RegisterPage from '../../pages/RegisterPage.jsx';
import ProfilePage from '../../pages/ProfilePage.jsx';
import AboutPage from '../../pages/AboutPage.jsx';
import AboutDicePage from '../../pages/AboutDicePage.jsx';
import TermsPage from '../../pages/TermsPage.jsx';
import PrivacyPage from '../../pages/PrivacyPage.jsx';
import ForgotPasswordPage from '../../pages/ForgotPasswordPage.jsx';
import VerifyEmailPage from '../../pages/VerifyEmailPage.jsx';
import ResetPasswordPage from '../../pages/ResetPasswordPage.jsx';
import SettingsPage from '../../pages/SettingsPage.jsx';
import AdminDashPage from '../../pages/AdminDashPage.jsx';
import AdminUserPage from '../../pages/AdminUserPage.jsx';
import AdminCommentPage from '../../pages/AdminCommentPage.jsx';
import AdminTournamentsPage from '../../pages/AdminTournamentsPage.jsx';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/games/new" element={<CreateGamePage />} />
          <Route path="/games/:id" element={<GamePage />} />
          <Route path="/tournaments" element={<TournamentListPage />} />
          <Route path="/tournaments/:id" element={<TournamentPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-dice" element={<AboutDicePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/admin" element={<AdminDashPage />} />
          <Route path="/admin/users" element={<AdminUserPage />} />
          <Route path="/admin/comments" element={<AdminCommentPage />} />
          <Route path="/admin/tournaments" element={<AdminTournamentsPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;