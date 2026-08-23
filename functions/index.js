const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────
// HELPER: Generate a unique ANVAY ID and atomically reserve it
// ─────────────────────────────────────────────────────────────
async function generateUniqueAnvayId(prefix, t) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(1000 + Math.random() * 9000).toString() +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = `ANVAY-${prefix}-${suffix}`;
    const reserveRef = db.collection('anvayIds').doc(id);
    const snap = await t.get(reserveRef);
    if (!snap.exists) {
      t.set(reserveRef, { reservedAt: admin.firestore.FieldValue.serverTimestamp() });
      return id;
    }
  }
  throw new Error('Could not generate a unique ANVAY ID after 10 attempts.');
}

// ─────────────────────────────────────────────────────────────
// PUBLIC: resolveLoginIdentifier
// Resolves username or ANVAY ID → email (Admin SDK bypasses rules)
// Never returns full user profile, only the email for sign-in.
// ─────────────────────────────────────────────────────────────
exports.resolveLoginIdentifier = functions.https.onCall(async (data) => {
  const { identifier } = data;
  if (!identifier || typeof identifier !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Identifier is required.');
  }

  const normalized = identifier.trim().toLowerCase();

  // Try username first
  let snap = await db.collection('users').where('usernameLower', '==', normalized).limit(1).get();
  if (!snap.empty) {
    return { email: snap.docs[0].data().email };
  }

  // Try ANVAY ID (case-insensitive stored uppercase)
  const anvayUpper = identifier.trim().toUpperCase();
  snap = await db.collection('users').where('anvayId', '==', anvayUpper).limit(1).get();
  if (!snap.empty) {
    return { email: snap.docs[0].data().email };
  }

  throw new functions.https.HttpsError('not-found', 'No account found with that identifier.');
});

// ─────────────────────────────────────────────────────────────
// PROTECTED: registerPatient
// Creates a Patient account atomically with uniqueness guarantees
// ─────────────────────────────────────────────────────────────
exports.registerPatient = functions.https.onCall(async (data) => {
  const {
    email, password, username, fullName,
    dateOfBirth, gender, bloodGroup, mobile,
    govtIdType, govtIdNumber
  } = data;

  if (!email || !password || !username || !fullName) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  const usernameLower = username.trim().toLowerCase();
  const usernameRef = db.collection('usernames').doc(usernameLower);

  // Step 1: Atomically reserve username + generate unique ANVAY ID
  let anvayId;
  try {
    await db.runTransaction(async (t) => {
      const usernameSnap = await t.get(usernameRef);
      if (usernameSnap.exists) {
        throw new functions.https.HttpsError('already-exists', 'Username is already taken.');
      }
      anvayId = await generateUniqueAnvayId('P', t);
      t.set(usernameRef, { reservedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('internal', err.message);
  }

  // Step 2: Create Firebase Auth user
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
  } catch (err) {
    // Rollback reservations if auth creation fails
    await db.collection('usernames').doc(usernameLower).delete().catch(() => {});
    await db.collection('anvayIds').doc(anvayId).delete().catch(() => {});
    throw new functions.https.HttpsError('internal', err.message);
  }

  // Step 3: Write Firestore user document
  await db.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    username: username.trim(),
    usernameLower,
    name: fullName,
    role: 'Patient',           // hardcoded — never from client input
    anvayId,
    dateOfBirth: dateOfBirth || '',
    gender: gender || '',
    bloodGroup: bloodGroup || '',
    mobile: mobile || '',
    govtIdType: govtIdType || '',
    govtIdNumber: govtIdNumber || '',
    photoURL: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Link username reservation to this uid
  await db.collection('usernames').doc(usernameLower).update({ uid: userRecord.uid });

  return { success: true, anvayId, uid: userRecord.uid };
});

// ─────────────────────────────────────────────────────────────
// PROTECTED: registerHospital
// Creates a Hospital Admin account atomically with uniqueness guarantees
// ─────────────────────────────────────────────────────────────
exports.registerHospital = functions.https.onCall(async (data) => {
  const {
    email, password, username,
    hospitalName, type, address, district, state,
    phone, regNumber, representative
  } = data;

  if (!email || !password || !username || !hospitalName || !regNumber) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  const usernameLower = username.trim().toLowerCase();
  const usernameRef = db.collection('usernames').doc(usernameLower);

  let anvayUserId, anvayHospitalId;
  try {
    await db.runTransaction(async (t) => {
      const usernameSnap = await t.get(usernameRef);
      if (usernameSnap.exists) {
        throw new functions.https.HttpsError('already-exists', 'Username is already taken.');
      }
      anvayUserId = await generateUniqueAnvayId('HA', t);
      anvayHospitalId = await generateUniqueAnvayId('H', t);
      t.set(usernameRef, { reservedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('internal', err.message);
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password, displayName: hospitalName + ' Admin' });
  } catch (err) {
    await db.collection('usernames').doc(usernameLower).delete().catch(() => {});
    await db.collection('anvayIds').doc(anvayUserId).delete().catch(() => {});
    await db.collection('anvayIds').doc(anvayHospitalId).delete().catch(() => {});
    throw new functions.https.HttpsError('internal', err.message);
  }

  const batch = db.batch();

  batch.set(db.collection('hospitals').doc(anvayHospitalId), {
    id: anvayHospitalId,
    adminUid: userRecord.uid,
    name: hospitalName,
    type: type || 'General Hospital',
    address: address || '',
    district: district || '',
    state: state || '',
    phone: phone || '',
    email,
    regNumber,
    representative: representative || '',
    verified: false,
    galleryPhotos: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  batch.set(db.collection('users').doc(userRecord.uid), {
    uid: userRecord.uid,
    email,
    username: username.trim(),
    usernameLower,
    name: hospitalName + ' Admin',
    role: 'Hospital Admin',    // hardcoded — never from client input
    anvayId: anvayUserId,
    hospitalId: anvayHospitalId,
    photoURL: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  await db.collection('usernames').doc(usernameLower).update({ uid: userRecord.uid });

  return { success: true, anvayId: anvayUserId, hospitalId: anvayHospitalId, uid: userRecord.uid };
});

// ─────────────────────────────────────────────────────────────
// PROTECTED: createStaffAccount  (Hospital Admin only)
// ─────────────────────────────────────────────────────────────
exports.createStaffAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'Hospital Admin' || !callerDoc.data().hospitalId) {
    throw new functions.https.HttpsError('permission-denied', 'Only verified Hospital Admins can create staff accounts.');
  }

  const callerData = callerDoc.data();
  const { email, password, fullName, specialization, role, mobile } = data;

  const allowedRoles = ['Doctor', 'Staff'];
  if (!email || !password || !fullName || !allowedRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid or missing fields. Role must be Doctor or Staff.');
  }

  const prefix = role === 'Doctor' ? 'D' : 'S';
  let anvayId;

  try {
    await db.runTransaction(async (t) => {
      anvayId = await generateUniqueAnvayId(prefix, t);
    });
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
  } catch (err) {
    await db.collection('anvayIds').doc(anvayId).delete().catch(() => {});
    throw new functions.https.HttpsError('internal', err.message);
  }

  await db.collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    name: fullName,
    role,                       // 'Doctor' or 'Staff' only — enforced above
    specialization: specialization || '',
    mobile: mobile || '',
    anvayId,
    hospitalId: callerData.hospitalId,
    assignedPatientIds: [],
    photoURL: '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, anvayId };
});

// ─────────────────────────────────────────────────────────────
// PROTECTED: changeStaffRole (Hospital Admin only)
// Allowed: Doctor ↔ Staff. Cannot elevate to Admin or above.
// ─────────────────────────────────────────────────────────────
exports.changeStaffRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'Hospital Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only Hospital Admins can change staff roles.');
  }

  const { targetUid, newRole } = data;
  const allowedRoles = ['Doctor', 'Staff'];
  if (!allowedRoles.includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Role must be Doctor or Staff.');
  }

  const targetDoc = await db.collection('users').doc(targetUid).get();
  if (!targetDoc.exists || targetDoc.data().hospitalId !== callerDoc.data().hospitalId) {
    throw new functions.https.HttpsError('not-found', 'Staff member not found in your hospital.');
  }

  await db.collection('users').doc(targetUid).update({
    role: newRole,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

// ─────────────────────────────────────────────────────────────
// PROTECTED: deleteStaffAccount (Hospital Admin only)
// ─────────────────────────────────────────────────────────────
exports.deleteStaffAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'Hospital Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only Hospital Admins can delete staff accounts.');
  }

  const { targetUid } = data;
  const targetDoc = await db.collection('users').doc(targetUid).get();
  if (!targetDoc.exists || targetDoc.data().hospitalId !== callerDoc.data().hospitalId) {
    throw new functions.https.HttpsError('not-found', 'Staff member not found in your hospital.');
  }

  // Delete Firebase Auth account
  await admin.auth().deleteUser(targetUid);
  // Delete Firestore document
  await db.collection('users').doc(targetUid).delete();

  return { success: true };
});

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// ACCOUNT DELETION SYSTEM
// ─────────────────────────────────────────────────────────────

// Request Account Deletion (Patient, Doctor, Hospital Admin)
exports.requestAccountDeletion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const { reason } = data || {};
  const uid = context.auth.uid;

  // Check for existing pending request
  const existingSnap = await db.collection('deletionRequests')
    .where('userId', '==', uid)
    .where('status', '==', 'Pending')
    .limit(1)
    .get();

  if (!existingSnap.empty) {
    throw new functions.https.HttpsError('already-exists', 'You already have a pending deletion request.');
  }

  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.exists ? userDoc.data() : {};

  const requestRef = await db.collection('deletionRequests').add({
    userId: uid,
    userEmail: userData.email || context.auth.token.email || '',
    userName: userData.name || userData.fullName || 'User',
    role: userData.role || 'Patient',
    anvayId: userData.anvayId || '',
    hospitalId: userData.hospitalId || '',
    reason: reason ? String(reason).trim() : 'No reason provided',
    status: 'Pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true, requestId: requestRef.id };
});

// Cancel Account Deletion Request
exports.cancelDeletionRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = context.auth.uid;
  const { requestId } = data || {};

  if (requestId) {
    const docRef = db.collection('deletionRequests').doc(requestId);
    const snap = await docRef.get();
    if (!snap.exists || snap.data().userId !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot cancel this request.');
    }
    await docRef.delete();
  } else {
    // Delete any pending requests for this user
    const snaps = await db.collection('deletionRequests')
      .where('userId', '==', uid)
      .where('status', '==', 'Pending')
      .get();
    
    const batch = db.batch();
    snaps.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  return { success: true };
});

// Process Account Deletion Request (Super Admin only)
exports.processDeletionRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'Super Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only Super Admins can process deletion requests.');
  }

  const { requestId, action, adminReason } = data || {};
  if (!requestId || !['Approved', 'Rejected'].includes(action)) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid requestId and action (Approved/Rejected) are required.');
  }

  const requestRef = db.collection('deletionRequests').doc(requestId);
  const requestSnap = await requestRef.get();
  if (!requestSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Deletion request not found.');
  }

  const reqData = requestSnap.data();
  const targetUid = reqData.userId;

  if (action === 'Approved') {
    // 1. Delete/Disable Firebase Auth Account
    try {
      await admin.auth().deleteUser(targetUid);
    } catch (authErr) {
      console.warn('Could not delete Firebase Auth user (may already be deleted):', authErr.message);
    }

    // 2. Mark Firestore user document as deleted (preserves medical records & provenance)
    await db.collection('users').doc(targetUid).set({
      status: 'Deleted',
      isDeleted: true,
      deletedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 3. Clean up username reservation if exists
    if (reqData.userEmail) {
      const usernameSnaps = await db.collection('usernames').where('uid', '==', targetUid).get();
      const batch = db.batch();
      usernameSnaps.docs.forEach(docSnap => batch.delete(docSnap.ref));
      await batch.commit().catch(() => {});
    }

    // 4. Update request status
    await requestRef.update({
      status: 'Approved',
      adminReason: adminReason ? String(adminReason).trim() : '',
      processedBy: context.auth.uid,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    // Rejected
    await requestRef.update({
      status: 'Rejected',
      adminReason: adminReason ? String(adminReason).trim() : '',
      processedBy: context.auth.uid,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  return { success: true };
});

// Self Deletion for Super Admin
exports.selfDeleteSuperAdmin = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const uid = context.auth.uid;
  const callerDoc = await db.collection('users').doc(uid).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'Super Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only Super Admins can use direct self-deletion.');
  }

  // Delete Auth account
  await admin.auth().deleteUser(uid);

  // Mark Firestore user document
  await db.collection('users').doc(uid).set({
    status: 'Deleted',
    isDeleted: true,
    deletedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true };
});

// ─────────────────────────────────────────────────────────────
// ADMIN SETUP: seedAdminAccounts
// ─────────────────────────────────────────────────────────────
exports.seedAdminAccounts = functions.https.onRequest(async (req, res) => {
  const accounts = [
    {
      email: 'superadmin@anvay.health',
      password: 'AnvaySuper@2024!',
      username: 'anvay_superadmin',
      name: 'ANVAY Super Admin',
      role: 'Super Admin',
      prefix: 'SA',
    },
    {
      email: 'govadmin@anvay.health',
      password: 'AnvayGov@2024!',
      username: 'anvay_govadmin',
      name: 'ANVAY Government Admin',
      role: 'Government Admin',
      prefix: 'GA',
    },
    {
      email: 'hospitaladmin@anvay.health',
      password: 'AnvayHospital@2024!',
      username: 'anvay_apollo_admin',
      name: 'Apollo Indraprastha Hospital Admin',
      role: 'Hospital Admin',
      prefix: 'HA',
    },
    {
      email: 'doctor@anvay.health',
      password: 'AnvayDoctor@2024!',
      username: 'dr_sharma',
      name: 'Dr. Rajesh Sharma',
      role: 'Doctor',
      prefix: 'D',
    }
  ];

  const results = [];

  for (const acc of accounts) {
    try {
      const usernameLower = acc.username.toLowerCase();
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email: acc.email,
          password: acc.password,
          displayName: acc.name,
        });
      } catch (e) {
        if (e.code === 'auth/email-already-exists') {
          userRecord = await admin.auth().getUserByEmail(acc.email);
          await admin.auth().updateUser(userRecord.uid, { password: acc.password, displayName: acc.name });
        } else throw e;
      }

      let anvayId;
      const existingUserDoc = await db.collection('users').doc(userRecord.uid).get();
      if (existingUserDoc.exists && existingUserDoc.data().anvayId) {
        anvayId = existingUserDoc.data().anvayId;
      } else {
        await db.runTransaction(async (t) => {
          anvayId = await generateUniqueAnvayId(acc.prefix, t);
          t.set(db.collection('usernames').doc(usernameLower), {
            uid: userRecord.uid,
            reservedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      }

      await db.collection('users').doc(userRecord.uid).set({
        uid: userRecord.uid,
        email: acc.email,
        username: acc.username,
        usernameLower,
        name: acc.name,
        fullName: acc.name,
        role: acc.role,
        anvayId,
        photoURL: '',
        status: 'Active',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      results.push({ email: acc.email, username: acc.username, password: acc.password, anvayId, role: acc.role, status: 'ready' });
    } catch (err) {
      results.push({ email: acc.email, error: err.message });
    }
  }

  res.json({ success: true, results });
});

