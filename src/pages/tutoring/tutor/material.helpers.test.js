import { describe, expect, test } from 'vitest'
import {
  buildTutorMaterialIdList,
  buildTutorMaterialImageUrl,
  buildTutorMaterialPreviewOptions,
  normalizeTutorMaterials,
  removeTutorMaterial,
  upsertTutorMaterial,
} from './material.helpers'
import { TUTOR_MATERIAL_TYPES } from './material.constants'

const TYPES = TUTOR_MATERIAL_TYPES

describe('tutor material helpers', () => {
  test('builds the certificates field as a comma-separated string ID list', () => {
    expect(buildTutorMaterialIdList([{ id: '11' }, { id: 22 }, { id: '' }])).toBe('11,22')
  })

  test('builds stable unique display URLs for materials sharing the same stored URL', () => {
    const sharedUrl = 'https://api.test/profile/certification/shared.jpg'
    const frontUrl = buildTutorMaterialImageUrl({ id: 'front-id', url: sharedUrl })
    const backUrl = buildTutorMaterialImageUrl({ id: 'back-id', url: sharedUrl })

    expect(frontUrl).toBe(`${sharedUrl}?materialId=front-id`)
    expect(backUrl).toBe(`${sharedUrl}?materialId=back-id`)
    expect(frontUrl).not.toBe(backUrl)
    expect(buildTutorMaterialImageUrl({ id: 'front-id', url: sharedUrl })).toBe(frontUrl)
  })

  test('preserves existing query and hash while replacing the material ID parameter', () => {
    const material = {
      id: 'new id',
      url: 'https://api.test/image.jpg?size=small&materialId=old#preview',
    }

    expect(buildTutorMaterialImageUrl(material))
      .toBe('https://api.test/image.jpg?size=small&materialId=new%20id#preview')
  })

  test('keeps an empty material URL empty', () => {
    expect(buildTutorMaterialImageUrl({ id: '1', url: '' })).toBe('')
  })

  test('uses the exact clicked display URL as the preview current image', () => {
    const sharedUrl = 'https://api.test/profile/certification/shared.jpg'
    const materials = [
      { id: 'front-id', type: TYPES.ID_CARD_FRONT, url: sharedUrl },
      { id: 'back-id', type: TYPES.ID_CARD_BACK, url: sharedUrl },
    ]

    const options = buildTutorMaterialPreviewOptions(materials, materials[1])

    expect(options.urls).toEqual([
      `${sharedUrl}?materialId=front-id`,
      `${sharedUrl}?materialId=back-id`,
    ])
    expect(options.current).toBe(options.urls[1])
  })

  test('replaces singleton material types without changing unrelated materials', () => {
    const source = [{ id: '1', type: TYPES.ID_CARD_FRONT }, { id: '2', type: TYPES.CERTIFICATE }]
    expect(upsertTutorMaterial(source, { id: '3', type: TYPES.ID_CARD_FRONT })).toEqual([
      { id: '3', type: TYPES.ID_CARD_FRONT },
      { id: '2', type: TYPES.CERTIFICATE },
    ])
  })

  test('keeps the ID-card front image when adding the back image', () => {
    const front = { id: 'front-id', type: TYPES.ID_CARD_FRONT, url: '/front.jpg' }
    const back = { id: 'back-id', type: TYPES.ID_CARD_BACK, url: '/back.jpg' }

    expect(upsertTutorMaterial([front], back)).toEqual([front, back])
  })

  test('appends multiple certificates', () => {
    const source = [{ id: '1', type: TYPES.CERTIFICATE }]
    expect(upsertTutorMaterial(source, { id: 2, type: TYPES.CERTIFICATE })).toEqual([
      { id: '1', type: TYPES.CERTIFICATE },
      { id: '2', type: TYPES.CERTIFICATE },
    ])
  })

  test('normalizes IDs and relative image URLs from the API', () => {
    const source = [{
      id: 99,
      type: 3,
      typeName: '学生证',
      directoryName: 'xsz',
      url: '/upload/student.jpg',
    }]

    expect(normalizeTutorMaterials(source, 'https://api.test')).toEqual([{
      id: '99',
      type: TYPES.STUDENT_CARD,
      typeName: '学生证',
      directoryName: 'xsz',
      url: 'https://api.test/upload/student.jpg',
    }])
  })

  test.each([
    ['https://api.test', '/profile/certification/a.jpg'],
    ['https://api.test/', 'profile/certification/a.jpg'],
  ])('joins the API base URL and managed material path without malformed slashes', (baseUrl, url) => {
    expect(normalizeTutorMaterials([{ id: 1, type: 4, url }], baseUrl)[0].url)
      .toBe('https://api.test/profile/certification/a.jpg')
  })

  test('rebases historical profile URLs onto the current API origin', () => {
    const materials = [{
      id: 1,
      type: 4,
      url: 'http://localhost:8080/profile/certification/old.jpg',
    }]

    expect(normalizeTutorMaterials(materials, 'https://zhiyujia.xyz')[0].url)
      .toBe('https://zhiyujia.xyz/profile/certification/old.jpg')
  })

  test('keeps external absolute material URLs unchanged', () => {
    const url = 'https://cdn.example.com/certificates/a.jpg'
    expect(normalizeTutorMaterials([{ id: 1, type: 4, url }], 'https://api.test')[0].url).toBe(url)
  })

  test('removes one selected material by string-safe ID comparison', () => {
    expect(removeTutorMaterial([{ id: '1' }, { id: 2 }], { id: '2' })).toEqual([{ id: '1' }])
  })
})
