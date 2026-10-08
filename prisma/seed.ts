import {
  PrismaClient,
  AdminRole,
  TargetAudience,
  ServiceCategory,
  MediaType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Super Admin
  const defaultAdminPassword = 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(defaultAdminPassword, 10);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@jmbattaglia.com' },
    update: {
      name: 'Super Administrator',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@jmbattaglia.com',
      passwordHash,
      name: 'Super Administrator',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin user seeded: ${superAdmin.email}`);

  // 2. Seed Core Service Definitions
  const servicesData = [
    {
      isnServiceId: 'SRV-RES-STANDARD',
      name: 'Standard Residential Inspection',
      shortDescription:
        'Comprehensive 400+ point full structural, mechanical, plumbing, and electrical assessment.',
      educationalText:
        'A full examination of the home from the roof to the foundation, evaluating safety hazards, major defects, and deferred maintenance.',
      category: ServiceCategory.PRIMARY,
      isAddon: false,
      iconUrl: 'https://assets.jmbattaglia.com/icons/home-inspection.svg',
      videoUrl: 'https://assets.jmbattaglia.com/videos/what-is-home-inspection.mp4',
      displayOrder: 1,
    },
    {
      isnServiceId: 'SRV-PRE-LISTING',
      name: 'Pre-Listing Seller Inspection',
      shortDescription:
        'Proactive inspection before listing your home to discover and fix defects before buyers negotiate.',
      educationalText:
        'Allows sellers to repair issues on their own schedule and price the property with complete confidence.',
      category: ServiceCategory.PRIMARY,
      isAddon: false,
      iconUrl: 'https://assets.jmbattaglia.com/icons/pre-listing.svg',
      displayOrder: 2,
    },
    {
      isnServiceId: 'SRV-RADON-TEST',
      name: 'Continuous Monitor Radon Testing',
      shortDescription:
        '48-hour continuous electronic radon monitor to test for carcinogenic radioactive gas.',
      educationalText:
        'Radon is the #1 cause of lung cancer among non-smokers. Electronic monitors provide hourly readings and instant post-test results.',
      category: ServiceCategory.ANCILLARY,
      isAddon: true,
      iconUrl: 'https://assets.jmbattaglia.com/icons/radon.svg',
      videoUrl: 'https://assets.jmbattaglia.com/videos/why-test-radon.mp4',
      displayOrder: 3,
    },
    {
      isnServiceId: 'SRV-TERMITE-WDO',
      name: 'Termite & WDO Inspection (NPMA-33)',
      shortDescription:
        'Official Wood-Destroying Organism report required by many lenders and VA/FHA mortgages.',
      educationalText:
        'Inspects for active subterranean termites, carpenter ants, powderpost beetles, and moisture damage in wooden structural components.',
      category: ServiceCategory.ANCILLARY,
      isAddon: true,
      iconUrl: 'https://assets.jmbattaglia.com/icons/termite.svg',
      displayOrder: 4,
    },
    {
      isnServiceId: 'SRV-SEWER-SCOPE',
      name: 'High-Definition Sewer Lateral Scope',
      shortDescription:
        'Video camera inspection of main sewer line from house out to the municipal connection or septic tank.',
      educationalText:
        'Standard home inspections do not cover underground pipes. Root intrusion, crushed pipes, and belly offsets can cost $10k+ to replace.',
      category: ServiceCategory.ANCILLARY,
      isAddon: true,
      iconUrl: 'https://assets.jmbattaglia.com/icons/sewer.svg',
      videoUrl: 'https://assets.jmbattaglia.com/videos/sewer-scope-guide.mp4',
      displayOrder: 5,
    },
    {
      isnServiceId: 'SRV-THERMAL-SCAN',
      name: 'Infrared Thermal Imaging Scan',
      shortDescription:
        'Thermal imaging camera scan to detect hidden insulation voids, roof leaks, and overheating electrical components.',
      educationalText:
        'FLIR thermal sensors visualize temperature differentials inside walls and ceilings that are invisible to the naked human eye.',
      category: ServiceCategory.ANCILLARY,
      isAddon: true,
      iconUrl: 'https://assets.jmbattaglia.com/icons/thermal.svg',
      displayOrder: 6,
    },
    {
      isnServiceId: 'SRV-MOLD-AIR',
      name: 'Mold & Air Quality Sampling',
      shortDescription:
        'Air pump cassette and swab testing with third-party accredited laboratory spore analysis.',
      educationalText:
        'Quantifies indoor mold spore concentration levels against an outdoor baseline control to identify active fungal growth.',
      category: ServiceCategory.ANCILLARY,
      isAddon: true,
      iconUrl: 'https://assets.jmbattaglia.com/icons/mold.svg',
      displayOrder: 7,
    },
  ];

  const serviceMap = new Map<string, string>();
  for (const srv of servicesData) {
    const record = await prisma.serviceDefinition.upsert({
      where: { isnServiceId: srv.isnServiceId },
      update: {
        name: srv.name,
        shortDescription: srv.shortDescription,
        educationalText: srv.educationalText,
        category: srv.category,
        isAddon: srv.isAddon,
        iconUrl: srv.iconUrl,
        videoUrl: srv.videoUrl ?? null,
        displayOrder: srv.displayOrder,
      },
      create: {
        isnServiceId: srv.isnServiceId,
        name: srv.name,
        shortDescription: srv.shortDescription,
        educationalText: srv.educationalText,
        category: srv.category,
        isAddon: srv.isAddon,
        iconUrl: srv.iconUrl,
        videoUrl: srv.videoUrl ?? null,
        displayOrder: srv.displayOrder,
      },
    });
    serviceMap.set(srv.isnServiceId, record.id);
  }
  console.log(`✅ Seeded ${serviceMap.size} Service Definitions`);

  // 3. Seed Packages
  const packagesData = [
    {
      slug: 'essential-home-inspection',
      name: 'Essential Home Inspection',
      shortDescription:
        'The foundational inspection covering all standard structural and mechanical components with detailed same-day report.',
      detailedDescription:
        'Ideal for newer homes or budget-conscious buyers seeking an expert visual evaluation of the roof, attic, HVAC, foundation, electrical, and plumbing systems.',
      badge: 'Popular',
      displayOrder: 1,
      isFeatured: false,
      targetAudience: TargetAudience.BUYER,
      isnPackageId: 'ISN-PKG-ESSENTIAL',
      coverImageUrl: 'https://assets.jmbattaglia.com/packages/essential.jpg',
      serviceIds: ['SRV-RES-STANDARD'],
      features: [
        'Complete 400+ point full visual inspection',
        'Same-day digital report with high-res photos',
        'Appliance RecallChek included',
        '90-day mechanical and structural warranty',
      ],
      recommendations: [
        {
          addonIsnId: 'SRV-RADON-TEST',
          pitchText:
            'Radon levels are elevated in 1 out of 3 local homes. Add 48hr continuous monitoring for peace of mind.',
          displayOrder: 1,
        },
        {
          addonIsnId: 'SRV-TERMITE-WDO',
          pitchText:
            'Recommended for all home purchases and required by most mortgage lenders.',
          displayOrder: 2,
        },
      ],
    },
    {
      slug: 'comprehensive-premier-bundle',
      name: 'Comprehensive Premier Inspection',
      shortDescription:
        'Our most protective package including home inspection, radon testing, termite report, and infrared thermal scan.',
      detailedDescription:
        'Designed for full peace of mind. Bundles the primary inspection with the three most critical diagnostic tests at an advantageous package rate.',
      badge: 'Best Value',
      displayOrder: 2,
      isFeatured: true,
      targetAudience: TargetAudience.ALL,
      isnPackageId: 'ISN-PKG-PREMIER',
      coverImageUrl: 'https://assets.jmbattaglia.com/packages/premier.jpg',
      serviceIds: [
        'SRV-RES-STANDARD',
        'SRV-RADON-TEST',
        'SRV-TERMITE-WDO',
        'SRV-THERMAL-SCAN',
      ],
      features: [
        'Standard Residential Home Inspection',
        'Continuous 48-Hour Electronic Radon Monitoring',
        'Wood-Destroying Organism (Termite) Report',
        'FLIR Infrared Thermal Scan for hidden moisture & heat leaks',
        'Same-day interactive digital report with video walk-through',
        'Extended 120-day structural protection warranty',
      ],
      recommendations: [
        {
          addonIsnId: 'SRV-SEWER-SCOPE',
          pitchText:
            'Protect against underground sewer pipe collapses which cost $8,000–$15,000 on average.',
          displayOrder: 1,
        },
        {
          addonIsnId: 'SRV-MOLD-AIR',
          pitchText:
            'Recommended if the home has a musty odor or past history of water intrusion.',
          displayOrder: 2,
        },
      ],
    },
    {
      slug: 'pre-listing-seller-inspection',
      name: 'Pre-Listing Seller Inspection',
      shortDescription:
        'Identify deferred repairs and potential buyer dealbreakers before putting your home on the market.',
      detailedDescription:
        'Eliminates surprises during buyer negotiations. Allows you to choose your own contractors and sell faster at full asking price.',
      badge: 'Seller Special',
      displayOrder: 3,
      isFeatured: false,
      targetAudience: TargetAudience.SELLER,
      isnPackageId: 'ISN-PKG-SELLER',
      coverImageUrl: 'https://assets.jmbattaglia.com/packages/seller.jpg',
      serviceIds: ['SRV-PRE-LISTING'],
      features: [
        'Complete pre-listing seller inspection report',
        'Executive summary highlighting highest-priority buyer objections',
        'Transferable Move-In Certified seller digital badge',
        'Post-repair verification re-inspection consultation',
      ],
      recommendations: [
        {
          addonIsnId: 'SRV-RADON-TEST',
          pitchText:
            'Prove healthy radon levels upfront to avoid last-minute escrow delays.',
          displayOrder: 1,
        },
      ],
    },
  ];

  for (const pkg of packagesData) {
    const createdPkg = await prisma.package.upsert({
      where: { slug: pkg.slug },
      update: {
        name: pkg.name,
        shortDescription: pkg.shortDescription,
        detailedDescription: pkg.detailedDescription,
        badge: pkg.badge,
        displayOrder: pkg.displayOrder,
        isFeatured: pkg.isFeatured,
        targetAudience: pkg.targetAudience,
        isnPackageId: pkg.isnPackageId,
        coverImageUrl: pkg.coverImageUrl,
      },
      create: {
        slug: pkg.slug,
        name: pkg.name,
        shortDescription: pkg.shortDescription,
        detailedDescription: pkg.detailedDescription,
        badge: pkg.badge,
        displayOrder: pkg.displayOrder,
        isFeatured: pkg.isFeatured,
        targetAudience: pkg.targetAudience,
        isnPackageId: pkg.isnPackageId,
        coverImageUrl: pkg.coverImageUrl,
      },
    });

    // Clear and link services
    await prisma.packageService.deleteMany({
      where: { packageId: createdPkg.id },
    });
    for (let i = 0; i < pkg.serviceIds.length; i++) {
      const srvId = serviceMap.get(pkg.serviceIds[i]);
      if (srvId) {
        await prisma.packageService.create({
          data: {
            packageId: createdPkg.id,
            serviceId: srvId,
            isIncluded: true,
            displayOrder: i + 1,
          },
        });
      }
    }

    // Clear and link features
    await prisma.packageFeature.deleteMany({
      where: { packageId: createdPkg.id },
    });
    for (let i = 0; i < pkg.features.length; i++) {
      await prisma.packageFeature.create({
        data: {
          packageId: createdPkg.id,
          title: pkg.features[i],
          displayOrder: i + 1,
        },
      });
    }

    // Clear and link recommendations
    await prisma.packageAddonRecommendation.deleteMany({
      where: { packageId: createdPkg.id },
    });
    for (const rec of pkg.recommendations) {
      const addonDbId = serviceMap.get(rec.addonIsnId);
      if (addonDbId) {
        await prisma.packageAddonRecommendation.create({
          data: {
            packageId: createdPkg.id,
            addonServiceId: addonDbId,
            pitchText: rec.pitchText,
            displayOrder: rec.displayOrder,
          },
        });
      }
    }
  }
  console.log(`✅ Seeded ${packagesData.length} Packages with features and recommendations`);

  // 4. Seed Educational Media
  const mediaData = [
    {
      title: 'What to Expect During Your Home Inspection',
      type: MediaType.VIDEO,
      url: 'https://assets.jmbattaglia.com/media/videos/inspection-walkthrough.mp4',
      thumbnailUrl: 'https://assets.jmbattaglia.com/media/thumbnails/inspection-overview.jpg',
      sectionKey: 'package-selection',
      description: 'A 2-minute overview explaining the 400-point inspection process and report delivery.',
      displayOrder: 1,
    },
    {
      title: 'Why Sewer Scoping Matters for Every Homebuyer',
      type: MediaType.VIDEO,
      url: 'https://assets.jmbattaglia.com/media/videos/sewer-scope-explainer.mp4',
      thumbnailUrl: 'https://assets.jmbattaglia.com/media/thumbnails/sewer-scope.jpg',
      sectionKey: 'addons-selection',
      description: 'See live underground camera footage of damaged sewer lines and how to protect yourself.',
      displayOrder: 2,
    },
    {
      title: 'Understanding Radon Gas In Your Area',
      type: MediaType.IMAGE,
      url: 'https://assets.jmbattaglia.com/media/infographics/radon-zone-chart.png',
      thumbnailUrl: 'https://assets.jmbattaglia.com/media/thumbnails/radon-chart-thumb.jpg',
      sectionKey: 'addons-selection',
      description: 'EPA regional Radon risk map and safety guidelines.',
      displayOrder: 3,
    },
  ];

  for (const m of mediaData) {
    const existing = await prisma.educationalMedia.findFirst({
      where: { title: m.title },
    });
    if (existing) {
      await prisma.educationalMedia.update({
        where: { id: existing.id },
        data: m,
      });
    } else {
      await prisma.educationalMedia.create({ data: m });
    }
  }
  console.log(`✅ Seeded ${mediaData.length} Educational Media items`);

  // 5. Seed Tooltips
  const tooltipsData = [
    {
      fieldKey: 'squareFeet',
      label: 'Square Footage',
      helpText: 'Enter the approximate finished square feet. This helps us allocate the correct inspection duration.',
      exampleText: 'e.g. 2,450 sq ft',
      stepIndex: 1,
    },
    {
      fieldKey: 'yearBuilt',
      label: 'Year Built',
      helpText: 'Homes built before 1978 may require additional safety checks for lead and older wiring styles.',
      exampleText: 'e.g. 1994',
      stepIndex: 1,
    },
    {
      fieldKey: 'inspectorUuid',
      label: 'Preferred Inspector',
      helpText: 'You can select a specific licensed inspector or choose Any Available Inspector for the fastest slot.',
      exampleText: 'Choose from available team members',
      stepIndex: 3,
    },
    {
      fieldKey: 'scheduledDateTime',
      label: 'Inspection Appointment Time',
      helpText: 'Our arrival windows are 15-minute aligned. Typical residential inspections take 2.5 to 3.5 hours.',
      exampleText: 'Select morning or afternoon window',
      stepIndex: 3,
    },
    {
      fieldKey: 'agentEmail',
      label: 'Real Estate Agent Email',
      helpText: 'If provided, we will automatically cc your agent on the appointment confirmation and report link.',
      exampleText: 'agent@brokerage.com',
      stepIndex: 4,
    },
  ];

  for (const t of tooltipsData) {
    await prisma.tooltip.upsert({
      where: { fieldKey: t.fieldKey },
      update: t,
      create: t,
    });
  }
  console.log(`✅ Seeded ${tooltipsData.length} UI Tooltips`);

  // 6. Seed Resource Items
  const resourceData = [
    {
      title: 'Sample Digital Inspection Report',
      description: 'Preview an interactive Spectora-style report with expandable high-def photos and defect filters.',
      fileUrl: 'https://assets.jmbattaglia.com/resources/sample-inspection-report.pdf',
      fileType: 'application/pdf',
      category: 'REPORTS',
      displayOrder: 1,
    },
    {
      title: 'Home Buyer Pre-Closing Inspection Checklist',
      description: 'A 10-step guide on what buyers should observe during the final walkthrough.',
      fileUrl: 'https://assets.jmbattaglia.com/resources/homebuyer-checklist.pdf',
      fileType: 'application/pdf',
      category: 'CHECKLISTS',
      displayOrder: 2,
    },
    {
      title: 'EPA Home Buyer’s and Seller’s Guide to Radon',
      description: 'Official EPA documentation on radon testing protocols and remediation mitigation options.',
      fileUrl: 'https://assets.jmbattaglia.com/resources/epa-radon-guide.pdf',
      fileType: 'application/pdf',
      category: 'GUIDES',
      displayOrder: 3,
    },
  ];

  for (const r of resourceData) {
    const existing = await prisma.resourceItem.findFirst({
      where: { title: r.title },
    });
    if (existing) {
      await prisma.resourceItem.update({
        where: { id: existing.id },
        data: r,
      });
    } else {
      await prisma.resourceItem.create({ data: r });
    }
  }
  console.log(`✅ Seeded ${resourceData.length} Resource Items`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
