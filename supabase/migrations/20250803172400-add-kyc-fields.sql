ALTER TABLE profiles ADD COLUMN kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN persona_inquiry_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN kyc_completed_at TIMESTAMP;
